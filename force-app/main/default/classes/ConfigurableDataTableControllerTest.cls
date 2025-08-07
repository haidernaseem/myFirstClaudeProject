import { LightningElement, track, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getRecords from '@salesforce/apex/ConfigurableDataTableController.getRecords';
import exportToCSV from '@salesforce/apex/ConfigurableDataTableController.exportToCSV';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ConfigurableDataTable extends LightningElement {
    @api title = 'Report: Financial Accounts';
    @api subtitle = 'My Portfolio';
    @api description = 'This report will be used on wealth portal to show financial accounts with future maturity date.';
    @api logoIcon = 'utility:chart';
    @api logoText = '';
    @api logoSubText = '';
    @api logoImage = '';
    
    // Data table configuration
    @api objectName = 'Account';
    @api columns = '[]';
    @api whereClause = '';
    @api orderBy = 'Name';
    @api limit = 100;
    
    // Filter configuration
    @api dateField = 'CreatedDate';
    @api showDateFilter = true;
    @api showCustomFilters = true;
    
    @track data = [];
    @track columns = [];
    @track filteredData = [];
    @track isLoading = false;
    @track showFilterPanel = false;
    @track totalRecords = 0;
    @track error;
    
    // Filter states
    @track dateFilter = 'all';
    @track customFilters = {};
    @track sortBy = '';
    @track sortDirection = 'asc';
    
    // Date filter options
    dateFilterOptions = [
        { label: 'All Time', value: 'all' },
        { label: 'Last 6 Months', value: '6months' },
        { label: 'This Quarter', value: 'quarter' },
        { label: 'This Year', value: 'year' },
        { label: 'Custom Range', value: 'custom' }
    ];
    
    // Custom date range
    @track customStartDate;
    @track customEndDate;
    
    wiredRecordsResult;

    connectedCallback() {
        //this.parseColumns();
        this.loadData();
    }

    @wire(getRecords, {
        objectName: '$objectName',
        columns: '$columns',
        whereClause: '$whereClause',
        orderBy: '$orderBy',
        limit: '$limit'
    })
    wiredRecords(result) {
        this.wiredRecordsResult = result;
        this.isLoading = true;
        
        if (result.data) {
            this.data = result.data;
            this.filteredData = [...this.data];
            this.totalRecords = this.data.length;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.data = [];
            this.filteredData = [];
            this.totalRecords = 0;
        }
        
        this.isLoading = false;
    }

    parseColumns() {
        try {
            if (typeof this.columns === 'string') {
                this.columns = JSON.parse(this.columns);
            }
        } catch (error) {
            console.error('Error parsing columns:', error);
            // Default columns for Account
            this.columns = [
                { label: 'Account Name', fieldName: 'Name', type: 'text', sortable: true },
                { label: 'Account Number', fieldName: 'AccountNumber', type: 'text', sortable: true },
                { label: 'Type', fieldName: 'Type', type: 'text', sortable: true },
                { label: 'Industry', fieldName: 'Industry', type: 'text', sortable: true },
                { label: 'Phone', fieldName: 'Phone', type: 'phone', sortable: true },
                { label: 'Created Date', fieldName: 'CreatedDate', type: 'date', sortable: true }
            ];
        }
    }

    // Toggle filter panel
    toggleFilterPanel() {
        this.showFilterPanel = !this.showFilterPanel;
    }

    // Handle date filter change
    handleDateFilterChange(event) {
        this.dateFilter = event.detail.value;
        this.applyFilters();
    }

    // Handle custom date range
    handleCustomDateChange(event) {
        const { name, value } = event.target;
        if (name === 'startDate') {
            this.customStartDate = value;
        } else if (name === 'endDate') {
            this.customEndDate = value;
        }
        this.applyFilters();
    }

    // Apply all filters
    applyFilters() {
        let filtered = [...this.data];
        
        // Apply date filter
        if (this.dateFilter !== 'all' && this.showDateFilter) {
            filtered = this.applyDateFilter(filtered);
        }
        
        // Apply custom filters
        if (this.showCustomFilters) {
            filtered = this.applyCustomFilters(filtered);
        }
        
        this.filteredData = filtered;
        this.totalRecords = filtered.length;
    }

    // Apply date filter
    applyDateFilter(data) {
        const now = new Date();
        let startDate = new Date();
        
        switch (this.dateFilter) {
            case '6months':
                startDate.setMonth(now.getMonth() - 6);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'custom':
                if (this.customStartDate && this.customEndDate) {
                    const start = new Date(this.customStartDate);
                    const end = new Date(this.customEndDate);
                    return data.filter(record => {
                        const recordDate = new Date(record[this.dateField]);
                        return recordDate >= start && recordDate <= end;
                    });
                }
                return data;
            default:
                return data;
        }
        
        return data.filter(record => {
            const recordDate = new Date(record[this.dateField]);
            return recordDate >= startDate;
        });
    }

    // Apply custom filters
    applyCustomFilters(data) {
        return data.filter(record => {
            return Object.keys(this.customFilters).every(key => {
                const filterValue = this.customFilters[key];
                if (!filterValue) return true;
                
                const recordValue = record[key];
                if (!recordValue) return false;
                
                return recordValue.toString().toLowerCase().includes(filterValue.toLowerCase());
            });
        });
    }

    // Handle custom filter change
    handleCustomFilterChange(event) {
        const { name, value } = event.target;
        this.customFilters[name] = value;
        this.applyFilters();
    }

    // Handle column sort
    handleSort(event) {
        const { fieldName, direction } = event.detail;
        this.sortBy = fieldName;
        this.sortDirection = direction;
        
        this.filteredData.sort((a, b) => {
            let aValue = a[fieldName];
            let bValue = b[fieldName];
            
            // Handle null values
            if (!aValue && !bValue) return 0;
            if (!aValue) return 1;
            if (!bValue) return -1;
            
            // Convert to string for comparison
            aValue = aValue.toString().toLowerCase();
            bValue = bValue.toString().toLowerCase();
            
            if (aValue < bValue) {
                return direction === 'asc' ? -1 : 1;
            } else if (aValue > bValue) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    // Refresh data
    async handleRefresh() {
        this.isLoading = true;
        try {
            await refreshApex(this.wiredRecordsResult);
            this.applyFilters();
            this.showToast('Success', 'Data refreshed successfully', 'success');
        } catch (error) {
            this.showToast('Error', 'Failed to refresh data', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // Export to CSV
    async handleExport() {
        try {
            this.isLoading = true;
            
            const csvData = await exportToCSV({
                objectName: this.objectName,
                columns: this.columns,
                whereClause: this.whereClause,
                orderBy: this.orderBy,
                limit: this.limit,
                dateFilter: this.dateFilter,
                customStartDate: this.customStartDate,
                customEndDate: this.customEndDate,
                customFilters: JSON.stringify(this.customFilters)
            });
            
            // Create and download CSV file
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.objectName}_Report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            this.showToast('Success', 'Data exported successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showToast('Error', 'Failed to export data', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    // Show toast message
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }

    // Get computed styles
    get headerStyles() {
        return `
            --primary-color: ${this.primaryColor || '#4A4A8C'};
            --secondary-color: ${this.secondaryColor || '#FFD700'};
        `;
    }

    // Get filter panel class
    get filterPanelClass() {
        return `filter-panel ${this.showFilterPanel ? 'show' : ''}`;
    }

    // Get custom date range visibility
    get showCustomDateRange() {
        return this.dateFilter === 'custom';
    }
}