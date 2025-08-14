import { LightningElement, api, track } from 'lwc';
import getListViewDataPageable from '@salesforce/apex/prm_GenericListViewController.getListViewDataPageable';
import getDateFieldsForConfig from '@salesforce/apex/prm_GenericListViewController.getDateFieldsForConfig';
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

    sortBy = 'Name';
	sortDirection = 'ASC';
	nameHeaderClass = 'slds-is-sortable slds-text-title_caps';
	isSortedByName = true;
	sortableFields = new Set();
	isNameSortable = true;
    isExporting = false;

	// Filters
	@track filtersOpen = false;
	@track dateFieldOptions = [];
	selectedDateField = null;
	selectedDateRange = 'ALL';

	get sortIconName() {
		return this.sortDirection === 'ASC' ? 'utility:arrowup' : 'utility:arrowdown';
	}
    
    get exportLabel() {
		return this.isExporting ? 'Exporting...' : 'Export';
	}
	get hasData() {
		return this.records && this.records.length > 0;
	}

	get filterLabel() {
		return this.filtersOpen ? 'Hide Filters' : 'Show Filters';
	}

	get dateRangeOptions() {
		return [
			{ label: 'All Time', value: 'ALL' },
			{ label: 'Last 3 Months', value: '3M' },
			{ label: 'Last 6 Months', value: '6M' },
			{ label: 'Last Year', value: '1Y' }
		];
	}

	connectedCallback() {
		this.loadInitial();
		this.fetchDateFields();
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

	async fetchDateFields() {
		try {
			const list = await getDateFieldsForConfig({ configName: this.configName });
			this.dateFieldOptions = (list || []).map(item => ({
				label: item.label,
				value: item.apiName
			}));
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error('Failed to load date fields', e);
			this.dateFieldOptions = [];
		}
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
				offsetSize: this.offset,
				sortField: this.sortBy,
				sortDirection: this.sortDirection,
				filterDateField: this.selectedDateField,
				filterRange: this.selectedDateRange
			});

			this.error = undefined;

			this.objectName = data.objectName;
			this.allowExport = !!data.allowExport;
			this.title = data.title || '';
			this.iconName = data.iconName || 'standard:record';
			this.fieldLabels = data.fieldLabels || this.fieldLabels;
			// Debug applied sort from server
			// Remove after verification
			// eslint-disable-next-line no-console
			console.log('Applied sort =>', data.appliedSortField, data.appliedSortDirection);

			// track allowed sortable fields from server
			if (data.sortableFields && Array.isArray(data.sortableFields)) {
				this.sortableFields = new Set(data.sortableFields.map(s => (s || '').trim()).filter(s => s));
			} else {
				this.sortableFields = new Set(['Name']);
			}

			if (!this.initialized) {
				this.fields = (data.fields || [])
					.map(f => f.trim())
					.filter(f => f !== 'Name' && f !== 'Id');
				this.buildHeaderColumns();
				this.initialized = true;
			}

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

			// eslint-disable-next-line no-console
			console.log('First rows:', this.records.slice(0, 5).map(r => r.Name));
		} catch (e) {
			this.error = e && e.body && e.body.message ? e.body.message : (e && e.message ? e.message : 'Unknown error');
			this.hasMore = false;
		} finally {
			this.isLoading = false;
		}
	}

	isSortableField(fieldApi) {
		return fieldApi && fieldApi.indexOf('.') === -1 && this.sortableFields.has(fieldApi);
	}

	buildHeaderColumns() {
		this.headerColumns = this.fields.map(f => {
			const isSorted = this.sortBy === f;
			const sortable = this.isSortableField(f);
			const baseCls = sortable ? 'slds-is-sortable slds-text-title_caps' : 'slds-text-title_caps';
			const cls = baseCls + (isSorted ? (' slds-is-sorted ' + (this.sortDirection === 'ASC' ? 'slds-is-sorted_asc' : 'slds-is-sorted_desc')) : '');
			return {
				apiName: f,
				label: this.fieldLabels && this.fieldLabels[f] ? this.fieldLabels[f] : f,
				isSorted,
				headerClass: cls,
				sortable
			};
		});
        this.isSortedByName = this.sortBy === 'Name';
		const nameSortable = this.sortableFields.has('Name');
		this.isNameSortable = nameSortable;
		this.nameHeaderClass = (nameSortable ? 'slds-is-sortable ' : '') + 'slds-text-title_caps' + (this.isSortedByName ? (' slds-is-sorted ' + (this.sortDirection === 'ASC' ? 'slds-is-sorted_asc' : 'slds-is-sorted_desc')) : '');
	}

	handleSort(event) {
		const field = event.currentTarget.dataset.field;
		if (!field) return;

		// Only allow server-side sort for metadata-allowed root fields
		if (!this.isSortableField(field)) {
			return;
		}

		if (this.sortBy === field) {
			this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
		} else {
			this.sortBy = field;
			this.sortDirection = 'ASC';
		}
		this.buildHeaderColumns();
		this.loadInitial();
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
		const el = event.target;
		const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
		if (nearBottom && !this.isLoading && this.hasMore) {
			this.fetchPage();
		}
	}

    get exportHeaderColumns() {
		return [{ apiName: 'Name', label: this.fieldLabels['Name'] || 'Name' }, ...this.headerColumns];
	}
	
	get exportFieldApis() {
		return ['Name', ...this.fields];
	}

	async handleExport() {
		if (!this.allowExport || this.isExporting) {
			return;
		}

		this.isExporting = true;
		try {
			// Header
			const headers = this.exportHeaderColumns.map(h => h.label);
			let csvContent = headers.join(',') + '\n';

			// Fetch all pages from server in larger chunks
			let expOffset = 0;
			const expPageSize = 2000; // faster export, stays within limits
			let hasMore = true;

			while (hasMore) {
				// eslint-disable-next-line no-await-in-loop
				const data = await getListViewDataPageable({
					configName: this.configName,
					limitSize: expPageSize,
					offsetSize: expOffset,
					sortField: this.sortBy,
					sortDirection: this.sortDirection,
					filterDateField: this.selectedDateField,
					filterRange: this.selectedDateRange
				});

				const pageRecords = data.records || [];
				pageRecords.forEach(rec => {
					const rowData = this.exportFieldApis.map(api => {
						const value = this.getValueByPath(rec, api) || '';
						return `"${value.toString().replace(/"/g, '""')}"`;
					});
					csvContent += rowData.join(',') + '\n';
				});

				hasMore = !!data.hasMore;
				expOffset += pageRecords.length;
			}

			const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
			const link = document.createElement('a');
			link.setAttribute('href', encodedUri);
			link.setAttribute('download', 'export.csv');
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} finally {
			this.isExporting = false;
		}
	}

	// Filter UI handlers
	toggleFilters() {
		this.filtersOpen = !this.filtersOpen;
	}

	handleDateFieldChange(event) {
		this.selectedDateField = event.detail.value || null;
	}

	handleDateRangeChange(event) {
		this.selectedDateRange = event.detail.value || 'ALL';
	}

	applyFilters() {
		// If range is not ALL, ensure a field is selected
		if (this.selectedDateRange !== 'ALL' && !this.selectedDateField) {
			this.error = 'Select a Date Field to apply the date range.';
			return;
		}
		this.error = undefined;
		this.loadInitial();
	}

	clearFilters() {
		this.selectedDateField = null;
		this.selectedDateRange = 'ALL';
		this.error = undefined;
		this.loadInitial();
	}
}