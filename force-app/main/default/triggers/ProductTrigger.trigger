trigger ProductTrigger on Product__c (after insert, after update, before update) {

    if(Trigger.isAfter) {
        ProductHelper.updateProdQuantity(Trigger.old);
    }
}