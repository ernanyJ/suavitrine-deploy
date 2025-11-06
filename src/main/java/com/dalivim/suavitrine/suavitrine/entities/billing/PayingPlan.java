package com.dalivim.suavitrine.suavitrine.entities.billing;

public enum PayingPlan {
    FREE(0),
    BASIC(2900),
    PRO(4900);

    private int price;

    PayingPlan(int price) {
        this.price = price;
    }
    
    public int getPrice() {
        return price;
    }
}
