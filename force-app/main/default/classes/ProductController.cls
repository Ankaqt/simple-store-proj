public with sharing class ProductController {

    @AuraEnabled
    public static List<Product__c> getProductList() {
        return [SELECT Id, Name, Category__c, Description__c, Cost__c, Quantity__c FROM Product__c LIMIT 10];
    }

    @AuraEnabled
    public static void createOrderItem(String orderItemName, Integer quantity, Id productId, Integer totalCost){   
        Order_Item__c newOrderItem = new Order_Item__c (
            Name = orderItemName,
            Product__c = productId,
            Quantity__c = quantity,
            Total_Cost__c = totalCost
        );
        System.debug('newOrderIteam'+ newOrderItem);
        insert newOrderItem;
    }

    @AuraEnabled
    public static List<Order_Item__c> getOrderItemList() {
        return [SELECT Id, Name, Product__c, Total_Cost__c, Quantity__c FROM Order_Item__c];
    }

    @AuraEnabled
    public static void clearOrderItem(Id orderItemId) {
        List <Order_Item__c> existingOrderItem = [SELECT Id FROM Order_Item__c WHERE id =: orderItemId];
        System.debug(existingOrderItem);
        delete existingOrderItem;    
    }

    @AuraEnabled
    public static void updateOrderItem(Id orderItemId, Integer changedQuantity, Integer changedTotalCost ) {
        Order_Item__c existingOrderItem = [SELECT Quantity__c, Total_Cost__c FROM Order_Item__c WHERE id =: orderItemId];
        existingOrderItem.Quantity__c = changedQuantity;
        existingOrderItem.Total_Cost__c = changedTotalCost;
        update existingOrderItem;    
    }

    @AuraEnabled
    public static void createOrder(String orderName, Id orderItemId){   
        Order__c newOrder = new Order__c (
            Name = orderName,
            Order_Item__c = orderItemId
        );
        System.debug('new Order'+ newOrder);
        insert newOrder;

        Order_Item__c orderItem = [SELECT Quantity__c, Product__c FROM Order_Item__c WHERE id =: orderItemId];
        Id idPro = orderItem.Product__c;
        Product__c prod = [SELECT Quantity__c FROM Product__c WHERE id =: idPro];
        prod.Quantity__c = prod.Quantity__c - orderItem.Quantity__c;
        update prod;
    }
}
