const axios = require('axios');

class NubanGenerator {

    static accountNumberLength = 10;
    static serialNumberLength = 9;

    // As seen from https://www.cbn.gov.ng/OUT/2011/CIRCULARS/BSPD/NUBAN%20PROPOSALS%20V%200%204-%2003%2009%202010.PDF
    // A*3+B*7+C*3+D*3+E*7+F*3+G*3+H*7+I*3+J*3+K*7+L*3 (CBN check digit algo)

    static getCheckDigit(serialNumber, bankCode) {
        const multiplierValues = "373373373373";

        if(serialNumber.length > NubanGenerator.serialNumberLength) {
            throw new Error(`Serial Number cannot be greater than ${NubanGenerator.serialNumberLength}  digits`)
        }

        const checkDigitString = `${bankCode}${serialNumber}`;

        // Get total of check digit algo by cbn
        let checkDigitTotal = 0;
        checkDigitString.split('').forEach((item, index) => {
            checkDigitTotal += Number(item) * Number(multiplierValues[index]);
        });

        // find modulo 10 (spec'd by cbn)
        checkDigitTotal %= 10;

        const checkDigit = 10 - checkDigitTotal;

        // If checkDigit is 10, return checkDigit as 0 (Spec'd by CBN)

        checkDigit == 10 ? 0 : checkDigit;

        return checkDigit;


    }

    static isValidNuban(accountNumber, bankCode) {
        if(typeof accountNumber !== "string") {
            throw new Error("Account Number must be of string type")
        }

        const serialNumber = accountNumber.substring(0, 9)
        if((!accountNumber) || ( accountNumber.length !== NubanGenerator.accountNumberLength)) {
            throw new Error ('Account Number must be 10 digits long')
        }

        console.log(NubanGenerator.getCheckDigit(serialNumber, bankCode))

        return NubanGenerator.getCheckDigit(serialNumber, bankCode) == Number(accountNumber[9])
    }

    static async generateNubans(nuban, bankCode) {

        const flutterwaveApiResponse = await axios({
            url: "https://api.flutterwave.com/v3/banks/NG",
            headers: {
                authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            },
            method: "GET",
        });

        const banks = flutterwaveApiResponse.data.data;

        console.log(banks);

        const bank = banks.find(bank => bank.code == bankCode);
       
        console.log(bank)
        
        if(!bank) {
            throw new Error("Bank code does not exist")
        }

        if(!NubanGenerator.isValidNuban(nuban, bankCode)) {
            throw new Error('Nuban must be valid!')
        }

        const serialNumberFirstSeven = nuban.substr(0, 7)

        // Get Account number 8th and 9th digit
        const strippedSerialNumber = Number(nuban.substr(7, 2));

        const previousSerialNumber = `${serialNumberFirstSeven}${strippedSerialNumber - 1}`;
        
        const nextSerialNumber = `${serialNumberFirstSeven}${strippedSerialNumber + 1}`;

        const previousNuban = `${previousSerialNumber}${NubanGenerator.getCheckDigit(previousSerialNumber, bankCode)}`;

        const nextNuban = `${nextSerialNumber}${NubanGenerator.getCheckDigit(nextSerialNumber, bankCode)}`;

        return [previousNuban, nuban, nextNuban];
    }
    
}

module.exports.NubanGenerator = NubanGenerator;

// console.log(NubanGenerator.generateNubans("0141072230", "058"));
