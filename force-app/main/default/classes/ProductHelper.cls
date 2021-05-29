public with sharing class ProductHelper {
    
    public static void updateProdQuantity(List<Product__c> prodList) {
        Product__c product;
        Id prodId;
        for (Product__c prod : prodList){
            prodId = prod.Id;
        }
        
        System.debug(prodId);
        product = [SELECT Quantity__c FROM Product__c WHERE Id =: prodId];
        System.debug(product);
        
        if(product.Quantity__c < 3) {
            System.debug(product.Quantity__c);
            product.Quantity__c = product.Quantity__c + 5;
            update product;
        }  
    }
}
