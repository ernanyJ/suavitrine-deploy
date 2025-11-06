package com.dalivim.suavitrine.suavitrine.entities.billing;

public enum PlanDuration {
    MONTHLY(30),
    YEARLY(365);

    private int duration;

    PlanDuration(int duration) {
        this.duration = duration;
    }

    public int getDuration() {
        return duration;
    }
}
