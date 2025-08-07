public with sharing class ConfigurableDataTableController {
    
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getRecords(String objectName, String columns, String whereClause, String orderBy, Integer limitSize ) {
        try {
            // Validate inputs
            if (String.isBlank(objectName)) {
                throw new AuraHandledException('Object name is required');
            }
            
            // Parse columns
            List<String> columnList = parseColumns(columns);
            if (columnList.isEmpty()) {
                throw new AuraHandledException('At least one column is required');
            }
            
            // Build SOQL query
            String soqlQuery = buildSOQLQuery(objectName, columnList, whereClause, orderBy, limitSize );
            
            // Execute query
            List<SObject> records = Database.query(soqlQuery);
            
            // Convert to List<Map<String, Object>>
            List<Map<String, Object>> result = new List<Map<String, Object>>();
            for (SObject record : records) {
                Map<String, Object> recordMap = new Map<String, Object>();
                for (String field : columnList) {
                    recordMap.put(field, record.get(field));
                }
                result.add(recordMap);
            }
            
            return result;
            
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving records: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static String exportToCSV(String objectName, String columns, String whereClause, String orderBy, Integer limitSize , 
                                   String dateFilter, String customStartDate, String customEndDate, String customFilters) {
        try {
            // Parse columns
            List<String> columnList = parseColumns(columns);
            if (columnList.isEmpty()) {
                throw new AuraHandledException('At least one column is required');
            }
            
            // Apply filters
            String filteredWhereClause = applyFilters(whereClause, dateFilter, customStartDate, customEndDate, customFilters);
            
            // Build SOQL query
            String soqlQuery = buildSOQLQuery(objectName, columnList, filteredWhereClause, orderBy, limitSize );
            
            // Execute query
            List<SObject> records = Database.query(soqlQuery);
            
            // Generate CSV
            String csvContent = generateCSV(records, columnList);
            
            return csvContent;
            
        } catch (Exception e) {
            throw new AuraHandledException('Error exporting to CSV: ' + e.getMessage());
        }
    }
    
    private static List<String> parseColumns(String columns) {
        List<String> columnList = new List<String>();
        
        if (String.isBlank(columns)) {
            // Default columns for Account
            return new List<String>{'Id', 'Name', 'AccountNumber', 'Type', 'Industry', 'Phone', 'CreatedDate'};
        }
        
        try {
            List<Object> columnConfigs = (List<Object>) JSON.deserializeUntyped(columns);
            for (Object columnConfig : columnConfigs) {
                Map<String, Object> config = (Map<String, Object>) columnConfig;
                String fieldName = (String) config.get('fieldName');
                if (String.isNotBlank(fieldName)) {
                    columnList.add(fieldName);
                }
            }
        } catch (Exception e) {
            // If parsing fails, return default columns
            return new List<String>{'Id', 'Name', 'AccountNumber', 'Type', 'Industry', 'Phone', 'CreatedDate'};
        }
        
        return columnList;
    }
    
    private static String buildSOQLQuery(String objectName, List<String> columns, String whereClause, String orderBy, Integer limitSize ) {
        String query = 'SELECT ' + String.join(columns, ', ') + ' FROM ' + objectName;
        
        if (String.isNotBlank(whereClause)) {
            query += ' WHERE ' + whereClause;
        }
        
        if (String.isNotBlank(orderBy)) {
            query += ' ORDER BY ' + orderBy;
        }
        
        if (limitSize  != null && limitSize  > 0) {
            query += ' limitSize  ' + limitSize ;
        }
        
        return query;
    }
    
    private static String applyFilters(String whereClause, String dateFilter, String customStartDate, String customEndDate, String customFilters) {
        List<String> conditions = new List<String>();
        
        // Add existing where clause
        if (String.isNotBlank(whereClause)) {
            conditions.add('(' + whereClause + ')');
        }
        
        // Apply date filter
        if (String.isNotBlank(dateFilter) && dateFilter != 'all') {
            String dateCondition = buildDateCondition(dateFilter, customStartDate, customEndDate);
            if (String.isNotBlank(dateCondition)) {
                conditions.add(dateCondition);
            }
        }
        
        // Apply custom filters
        if (String.isNotBlank(customFilters)) {
            try {
                Map<String, Object> filters = (Map<String, Object>) JSON.deserializeUntyped(customFilters);
                for (String field : filters.keySet()) {
                    Object value = filters.get(field);
                    if (value != null && String.isNotBlank(String.valueOf(value))) {
                        conditions.add(field + ' LIKE \'%' + String.escapeSingleQuotes(String.valueOf(value)) + '%\'');
                    }
                }
            } catch (Exception e) {
                // Ignore custom filter parsing errors
            }
        }
        
        return String.join(conditions, ' AND ');
    }
    
    private static String buildDateCondition(String dateFilter, String customStartDate, String customEndDate) {
        Date today = Date.today();
        Date startDate;
        Date endDate = today;
        
        if (dateFilter == '6months') {
            startDate = today.addMonths(-6);
        } else if (dateFilter == 'quarter') {
            Integer month = today.month();
            Integer quarter = Math.mod(month - 1, 3) + 1;
            startDate = Date.newInstance(today.year(), (quarter - 1) * 3 + 1, 1);
        } else if (dateFilter == 'year') {
            startDate = Date.newInstance(today.year(), 1, 1);
        } else if (dateFilter == 'custom') {
            if (String.isNotBlank(customStartDate) && String.isNotBlank(customEndDate)) {
                startDate = Date.valueOf(customStartDate);
                endDate = Date.valueOf(customEndDate);
            } else {
                return '';
            }
        } else {
            return '';
        }
        
        return 'CreatedDate >= ' + startDate.format() + ' AND CreatedDate <= ' + endDate.format();
    }
    
    private static String generateCSV(List<SObject> records, List<String> columns) {
        if (records.isEmpty()) {
            return '';
        }
        
        // Get column labels
        Map<String, String> fieldLabels = getFieldLabels(records[0].getSObjectType(), columns);
        
        // Build CSV header
        List<String> headers = new List<String>();
        for (String column : columns) {
            headers.add(fieldLabels.containsKey(column) ? fieldLabels.get(column) : column);
        }
        
        // Build CSV content
        List<String> csvLines = new List<String>();
        csvLines.add(String.join(headers, ','));
        
        for (SObject record : records) {
            List<String> row = new List<String>();
            for (String column : columns) {
                Object value = record.get(column);
                String stringValue = formatValueForCSV(value);
                row.add(stringValue);
            }
            csvLines.add(String.join(row, ','));
        }
        
        return String.join(csvLines, '\n');
    }
    
    private static Map<String, String> getFieldLabels(SObjectType objectType, List<String> fields) {
        Map<String, String> fieldLabels = new Map<String, String>();
        
        try {
            Map<String, Schema.SObjectField> fieldMap = objectType.getDescribe().fields.getMap();
            for (String field : fields) {
                if (fieldMap.containsKey(field)) {
                    fieldLabels.put(field, fieldMap.get(field).getDescribe().getLabel());
                } else {
                    fieldLabels.put(field, field);
                }
            }
        } catch (Exception e) {
            // If we can't get field labels, use field names
            for (String field : fields) {
                fieldLabels.put(field, field);
            }
        }
        
        return fieldLabels;
    }
    
    private static String formatValueForCSV(Object value) {
        if (value == null) {
            return '';
        }
        
        String stringValue = String.valueOf(value);
        
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.contains(',') || stringValue.contains('"') || stringValue.contains('\n')) {
            stringValue = stringValue.replace('"', '""');
            stringValue = '"' + stringValue + '"';
        }
        
        return stringValue;
    }
}