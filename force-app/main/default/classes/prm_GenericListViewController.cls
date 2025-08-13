public with sharing class prm_GenericListViewController {
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getListViewData(String configName) {
        prm_ListViewConfig__mdt config = [
            SELECT prm_Object_API_Name__c, prm_Field_API_Names__c, prm_Where_Clause__c, 
                   prm_Allow_Export__c, prm_Title__c, prm_Icon_Name__c
            FROM prm_ListViewConfig__mdt
            WHERE DeveloperName = :configName
            LIMIT 1
        ];

        String objectName = config.prm_Object_API_Name__c;
        String[] fieldArray = config.prm_Field_API_Names__c.split(',');
        String whereClause = String.isNotBlank(config.prm_Where_Clause__c) ? config.prm_Where_Clause__c : '';
        
        String soql = 'SELECT ' + String.join(fieldArray, ',') + ' FROM ' + objectName + ' ' + whereClause;
        List<SObject> records = Database.query(soql);

        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
        Map<String, String> fieldLabels = new Map<String, String>();
        for (String api : fieldArray) {
			String cleanApi = api.trim();
			String baseField = cleanApi.contains('.') ? cleanApi.split('\\.')[0] : cleanApi;

			if (fieldMap.containsKey(baseField)) {
				fieldLabels.put(cleanApi, fieldMap.get(baseField).getDescribe().getLabel());
			} else {
				fieldLabels.put(cleanApi, cleanApi);
			}
		}

        Map<String, Object> result = new Map<String, Object>();
        result.put('records', records);
        result.put('fields', fieldArray);
        result.put('fieldLabels', fieldLabels);
        result.put('objectName', objectName);
        result.put('allowExport', config.prm_Allow_Export__c);
        result.put('title', config.prm_Title__c);
        result.put('iconName', config.prm_Icon_Name__c);

        return result;
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getListViewDataPageable(String configName, Integer limitSize, Integer offsetSize, String sortField, String sortDirection) {
        prm_ListViewConfig__mdt config = [
            SELECT prm_Object_API_Name__c, prm_Field_API_Names__c, prm_Where_Clause__c, 
                   prm_Allow_Export__c, prm_Title__c, prm_Icon_Name__c, prm_Sortable_Fields__c
            FROM prm_ListViewConfig__mdt
            WHERE DeveloperName = :configName
            LIMIT 1
        ];

        Integer pageSize = (limitSize == null || limitSize <= 0) ? 20 : limitSize;
        Integer pageOffset = (offsetSize == null || offsetSize < 0) ? 0 : offsetSize;

        String objectName = config.prm_Object_API_Name__c;
        List<String> fieldList = new List<String>();
        for (String f : config.prm_Field_API_Names__c.split(',')) {
            fieldList.add(f.trim());
        }

        Set<String> fieldSet = new Set<String>(fieldList);
        fieldSet.add('Id');
        fieldSet.add('Name');
        fieldList = new List<String>(fieldSet);

        String whereClause = String.isNotBlank(config.prm_Where_Clause__c) ? config.prm_Where_Clause__c : '';

        // Allowed sortable fields from metadata (root fields only)
        Set<String> allowedSortable = new Set<String>();
        if (String.isNotBlank(config.prm_Sortable_Fields__c)) {
            for (String s : config.prm_Sortable_Fields__c.split(',')) {
                String f = s != null ? s.trim() : null;
                if (!String.isBlank(f) && !f.contains('.')) {
                    allowedSortable.add(f);
                }
            }
        }
        if (allowedSortable.isEmpty()) {
            allowedSortable.add('Name');
        }

        // Safe sort field and direction
        String safeSortField = 'Name';
        if (!String.isBlank(sortField)) {
            String candidate = sortField.trim();
            if (!candidate.contains('.') && fieldSet.contains(candidate) && allowedSortable.contains(candidate)) {
                safeSortField = candidate;
            }
        }
        String dir = (sortDirection != null && sortDirection.toUpperCase() == 'DESC') ? 'DESC' : 'ASC';

        // Deterministic ORDER BY with Id tiebreaker
        String orderClause = ' ORDER BY ' + safeSortField + ' ' + dir + (safeSortField == 'Id' ? '' : (', Id ' + dir));
        String soql = 'SELECT ' + String.join(fieldList, ',') +
                      ' FROM ' + objectName + ' ' + whereClause +
                      orderClause +
                      ' LIMIT ' + (pageSize + 1) +
                      ' OFFSET ' + pageOffset;

        List<SObject> queried = Database.query(soql);

        Boolean hasMore = queried.size() > pageSize;
        if (hasMore) {
            queried.remove(queried.size() - 1);
        }

        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
        Map<String, String> fieldLabels = new Map<String, String>();
        for (String api : fieldList) {
            String cleanApi = api.trim();
            String baseField = cleanApi.contains('.') ? cleanApi.split('\\.')[0] : cleanApi;
            if (fieldMap.containsKey(baseField)) {
                fieldLabels.put(cleanApi, fieldMap.get(baseField).getDescribe().getLabel());
            } else {
                fieldLabels.put(cleanApi, cleanApi);
            }
        }

        Map<String, Object> result = new Map<String, Object>();
        result.put('records', queried);
        result.put('fields', fieldList);
        result.put('fieldLabels', fieldLabels);
        result.put('objectName', objectName);
        result.put('allowExport', config.prm_Allow_Export__c);
        result.put('title', config.prm_Title__c);
        result.put('iconName', config.prm_Icon_Name__c);
        result.put('hasMore', hasMore);
        result.put('sortableFields', new List<String>(allowedSortable));
        result.put('appliedSortField', safeSortField);
        result.put('appliedSortDirection', dir);

        return result;
    }
}