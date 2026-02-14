package com.project.InfluenceX.model.RequestDTO;

public class PhoneNumberVerificationRequestDTO {

    private String phoneNumber;
    private String otp;

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getOtp() {
        return otp;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
