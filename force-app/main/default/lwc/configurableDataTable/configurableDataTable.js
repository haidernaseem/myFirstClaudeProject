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
    @api primaryColor = '#4A4A8C';
    @api secondaryColor = '#FFD700';
    
    // Data table configuration
    @api objectName = 'Account';
    @api whereClause = '';
    @api orderBy = 'CreatedDate';
    @api limit = 100;
    
    // Filter configuration
    @api dateField = 'CreatedDate';
    @api showDateFilter = false;
    @api showCustomFilters = false;
    
    @track data = [
        {
            Id: '0011x000003NGqqAAG',
            Name: 'Acme Corp',
            AccountNumber: '12345',
            Type: 'Customer',
            Industry: 'Manufacturing',
            Phone: '123-456-7890',
            CreatedDate: '2023-01-15'
        }
    ];
    @api columns = [
        { label: 'Account Name', fieldName: 'Name', type: 'text', sortable: true },
        { label: 'Account Number', fieldName: 'AccountNumber', type: 'text', sortable: true },
        { label: 'Type', fieldName: 'Type', type: 'text', sortable: true },
        { label: 'Industry', fieldName: 'Industry', type: 'text', sortable: true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone', sortable: true },
        { label: 'Created Date', fieldName: 'CreatedDate', type: 'date', sortable: true }
    ];
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

    renderedCallback() {
        console.log('Columns:', this.columns);
        console.log('Filtered Data:', this.data);
    }

    @wire(getRecords, {
        objectName: '$objectName',
        columns: 'Name, AccountNumber, Type, Industry, Phone, CreatedDate',
        whereClause: '$whereClause',
        orderBy: '$orderBy',
        limit: '$limit'
    })
    wiredRecords(result) {
        console.log('wiredRecords');
        console.log(JSON.stringify(result));
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

    // Handle column sort
    handleSort(event) {
        const { fieldName, sortDirection } = event.detail;
        this.sortBy = fieldName;
        this.sortDirection = sortDirection;
    
        // Clone the array to trigger reactivity
        const sortedData = [...this.filteredData];
    
        sortedData.sort((a, b) => {
            let aValue = a[fieldName];
            let bValue = b[fieldName];
    
            // Handle null/undefined
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;
    
            // Normalize values for comparison
            aValue = aValue.toString().toLowerCase();
            bValue = bValue.toString().toLowerCase();
    
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    
        // Assign back to trigger UI update
        this.filteredData = sortedData;
    }
    
     
} 