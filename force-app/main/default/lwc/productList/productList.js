import { LightningElement, track } from 'lwc';
import getProductList from '@salesforce/apex/ProductController.getProductList';
import createOrderItem from '@salesforce/apex/ProductController.createOrderItem';
import getOrderItemList from '@salesforce/apex/ProductController.getOrderItemList';
import clearOrderItem from '@salesforce/apex/ProductController.clearOrderItem';
import createOrder from '@salesforce/apex/ProductController.createOrder';

const actions = [
    { label: 'Buy', name: 'buy' },
    { label: 'Clear', name: 'clear' },
];

const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Category', fieldName: 'Category__c' },
    { label: 'Description', fieldName: 'Description__c' },
    { label: 'Cost', fieldName: 'Cost__c', type: 'currency', typeAttributes: { currencyCode: 'USD' }},
    { label: 'Available quantity', fieldName: 'Quantity__c' },
    { type: "button", typeAttributes: {  
        label: 'Add to Cart',  
        name: 'addToCart',    
        disabled: false,    
        iconPosition: 'left',
    }}    
];

const orderItemColumns = [
    {label: 'Name', fieldName: 'Name'},
    {label: 'Total cost', fieldName: 'Total_Cost__c', type: 'currency', typeAttributes: { currencyCode: 'USD' }},
    {label: 'Quantity', fieldName: 'Quantity__c'},
    {type: "button", typeAttributes: {  
        label: '+',  
        name: 'increase',    
        disabled: false,    
        iconPosition: 'left',
    }},
    {type: "button", typeAttributes: {  
        label: '-',  
        name: 'decrease',    
        disabled: false,    
        iconPosition: 'left',
    }},
    {type: "button", typeAttributes: {  
        label: 'Buy',  
        name: 'buy',    
        disabled: false,    
        iconPosition: 'left',
    }},
    {type: "button", typeAttributes: {  
        label: 'Clear',  
        name: 'clear',    
        disabled: false,    
        iconPosition: 'left',
    }}
]

export default class ProductList extends LightningElement {
    
    displayProductName;
    displayProductDescription;
    displayChoosenQuantity = 1;
    displayProductQuantity;
    displayProductUnitCost;
    displayTotalCost;
    productRowId; 
    orderItemRowId;
    orderItemName;
    orderItemQuantity;
    orderItemTotalCost;
    productsBeforeFilter = [];
    error;
    products = [];
    orderItems = [];
    productColumns = columns;
    cartColumns = orderItemColumns;
    isModalOpen = false;
    isInsertSuccessfull = false;
    isModalOpenCart = false;

    openModalCart() {
        this.isModalOpenCart = true;
    }

    closeModalCart() {
        this.isModalOpenCart = false;
    }

    submitDetailsCart() {
        this.isModalOpenCart = false;
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    submitDetails() {
        this.isModalOpen = false;
    }

    get options() {
        return [
            { label: 'No Filter', value: 'noFilter' },
            { label: 'Laptop', value: 'Laptop' },
            { label: 'TV', value: 'TV' },
            { label: 'Smartphone', value: 'Smartphone' }
        ];
    }

    handleFilterChange(event) {
        let filteredProducts = [];
        this.value = event.detail.value;
        if(this.value !== 'noFilter') {
            this.clearProducts();
            this.products = this.productsBeforeFilter;
        
            this.products.forEach(element => {
                if(element.Category__c === this.value){
                    filteredProducts.push(element);
                }
            });
            this.clearProducts();
            this.products = filteredProducts;
        } else {
            this.clearProducts();
            this.products = this.productsBeforeFilter;
        }  
    }

    clearProducts() {
        this.products = [];
    }

    connectedCallback() {
        this.getProducts();
    }

    getProducts() {
        return getProductList({})
        .then(result => {
            console.log(result);
            if(result != null){
                this.products = result;
                this.productsBeforeFilter = result;
            }
        }).catch(error => {
            this.error = error;
        });
    }

    handleRowAction(event) {
        console.log(event.detail.action.name);
        this.openModal();
        this.displayProductName = event.detail.row.Name;
        this.displayProductDescription = event.detail.row.Description__c;
        this.displayProductQuantity = event.detail.row.Quantity__c;
        this.displayProductUnitCost = event.detail.row.Cost__c;
        this.productRowId = event.detail.row.Id;
        this.displayTotalCost = event.detail.row.Cost__c;
        this.displayChoosenQuantity = 1;
    }

    increaseQuantityAndTotalCost() {
        this.displayChoosenQuantity++;
        if(this.displayChoosenQuantity <= this.displayProductQuantity) {
            this.displayTotalCost += this.displayProductUnitCost;
        }
        
        if (this.displayChoosenQuantity >= this.displayProductQuantity) {
            this.displayChoosenQuantity = this.displayProductQuantity;   
        }   
    }

    decreaseQuantityAndTotalCost() {
        if (this.displayChoosenQuantity > 1) {
            this.displayChoosenQuantity--;
            this.displayTotalCost -= this.displayProductUnitCost;
        }    
    }

    submitDetails() {
        createOrderItem({   orderItemName: this.displayProductName, 
                            quantity: this.displayChoosenQuantity,
                            productId: this.productRowId,
                            totalCost: this.displayTotalCost}); 

        this.closeModal();
        this.isInsertSuccessfull = true;      
    }

    openCart() {
        this.openModalCart();
        this.getOrderItems();  
    }

    getOrderItems() {
        return getOrderItemList({})
        .then(result => {
            console.log(result);
            if(result != null){
                this.orderItems = result;
            }
        }).catch(error => {
            this.error = error;
        });
    }

    handleRowActionOrderItem(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        this.orderItemRowId = event.detail.row.Id;
        this.orderItemName = event.detail.row.Name;
        this.orderItemQuantity = event.detail.row.Quantity__c;
        this.orderItemTotalCost = event.detail.row.Total_Cost__c;
        this.orderItems = JSON.parse(JSON.stringify(this.orderItems));

        if (actionName === 'buy') {
            
            createOrder({   orderName : this.orderItemName,
                            orderItemId : this.orderItemRowId
            });

        } else if (actionName === 'clear') {
            this.orderItems = this.orderItems.filter(orderItem => row.Id !== orderItem.Id);
            clearOrderItem({ orderItemId: this.orderItemRowId
            });
   
        } else if (actionName === 'increase') {
            for(let i = 0; i < this.orderItems.length; i++) {
                if (this.orderItems[i].Id === this.orderItemRowId) {
                    this.orderItems[i].Quantity__c++;
                    console.log(this.orderItems[i].Quantity__c);
                }
            }
            
        } else if (actionName === 'decrease') {
            for(let i = 0; i < this.orderItems.length; i++) {
                if (this.orderItems[i].Id === this.orderItemRowId) {
                    this.orderItems[i].Quantity__c--;
                    console.log(this.orderItems[i].Quantity__c);
                }
            }
        }
    }
}