import { LightningElement, api, track } from 'lwc';
import getListViewDataPageable from '@salesforce/apex/prm_GenericListViewController.getListViewDataPageable';
import { NavigationMixin } from 'lightning/navigation';

export default class Prm_GenericListViewLWR extends NavigationMixin(LightningElement) {
    @api configName;
    @track records = [];
    @track fields = [];
    @track fieldLabels = {};
    @track objectName;
    @track title;
    @track iconName;
    @track allowExport = false;
    @track error;
    @track headerColumns = [];

    pageSize = 20;
    offset = 0;
    isLoading = false;
    hasMore = true;
    initialized = false;

    get hasData() {
        return this.records && this.records.length > 0;
    }

    connectedCallback() {
        this.loadInitial();
    }

    loadInitial() {
        this.records = [];
        this.fields = [];
        this.headerColumns = [];
        this.fieldLabels = {};
        this.offset = 0;
        this.hasMore = true;
        this.error = undefined;
        this.initialized = false;
        this.fetchPage();
    }

    async fetchPage() {
        if (this.isLoading || !this.hasMore) {
            return;
        }
        this.isLoading = true;
        try {
            const data = await getListViewDataPageable({
                configName: this.configName,
                limitSize: this.pageSize,
                offsetSize: this.offset
            });

            this.error = undefined;

            // Static meta
            this.objectName = data.objectName;
            this.allowExport = !!data.allowExport;
            this.title = data.title || '';
            this.iconName = data.iconName || 'standard:record';
            this.fieldLabels = data.fieldLabels || this.fieldLabels;

            // Fields and headers (first page only or when not yet initialized)
            if (!this.initialized) {
                // Remove Name/Id from display fields but keep them for internal usage
                this.fields = (data.fields || [])
                    .map(f => f.trim())
                    .filter(f => f !== 'Name' && f !== 'Id');
                this.headerColumns = this.fields.map(f => {
                    return {
                        apiName: f,
                        label: this.fieldLabels && this.fieldLabels[f] ? this.fieldLabels[f] : f
                    };
                });
                this.initialized = true;
            }

            // Records mapping
            const newRecords = (data.records || []).map(rec => {
                const nameValue = this.getValueByPath(rec, 'Name') || '';
                const cells = this.fields.map(fieldApi => ({
                    field: fieldApi,
                    value: this.getValueByPath(rec, fieldApi)
                }));
                return { Id: rec.Id, Name: nameValue, cells };
            });

            this.records = [...this.records, ...newRecords];
            this.offset += newRecords.length;
            this.hasMore = !!data.hasMore;
        } catch (e) {
            this.error = e && e.body && e.body.message ? e.body.message : (e && e.message ? e.message : 'Unknown error');
            this.hasMore = false;
        } finally {
            this.isLoading = false;
        }
    }

    getValueByPath(obj, path) {
        if (!obj || !path) return '';
        return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '';
    }

    navigateToRecord(event) {
        const recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: { recordId, objectApiName: this.objectName, actionName: 'view' }
        });
    }

    handleScroll(event) {
        console.log('Scroll');
        const el = event.target;
        const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
        if (nearBottom && !this.isLoading && this.hasMore) {
            this.fetchPage();
        }
    }

    handleExport() {
        if (!this.allowExport || !this.hasData) {
            return;
        }

        // Prepare CSV content
        let csvContent = this.headerColumns.map(col => col.label).join(',') + '\n';

        this.records.forEach(row => {
            let rowData = this.fields.map(fieldApi => {
                const cell = row.cells.find(c => c.field === fieldApi);
                let value = cell ? cell.value : '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            });
            csvContent += rowData.join(',') + '\n';
        });

        const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);

        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}