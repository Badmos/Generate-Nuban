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
        let checkDigitRemainder = checkDigitTotal % 10;

        let checkDigit = 10 - checkDigitRemainder;

        // If checkDigit is 10, return checkDigit as 0 (Spec'd by CBN)

        const checkDigitValue = checkDigit == 10 ? 0 : checkDigit;

        return checkDigitValue;

    }


    static getCheckDigitForOFI(serialNumber, bankCode) {
        const multiplierValues = "373373373373373";

        if(serialNumber.length > NubanGenerator.serialNumberLength) {
            throw new Error(`Serial Number cannot be greater than ${NubanGenerator.serialNumberLength}  digits`)
        }

        const checkDigitString = `9${bankCode}${serialNumber}`;

        // Get total of check digit algo by cbn
        let checkDigitTotal = 0;
        checkDigitString.split('').forEach((item, index) => {
            checkDigitTotal += Number(item) * Number(multiplierValues[index]);
        });

        // find modulo 10 (spec'd by cbn)
        let checkDigitRemainder = checkDigitTotal % 10;

        let checkDigit = 10 - checkDigitRemainder;

        // If checkDigit is 10, return checkDigit as 0 (Spec'd by CBN)

        const checkDigitValue = checkDigit == 10 ? 0 : checkDigit;

        return checkDigitValue;

    }


    static isValidNuban(accountNumber, bankCode) {
        if(typeof accountNumber !== "string") {
            throw new Error("Account Number must be of string type")
        }

        const serialNumber = accountNumber.substring(0, 9);
        if((!accountNumber) || ( accountNumber.length !== NubanGenerator.accountNumberLength)) {
            throw new Error ('Account Number must be 10 digits long')
        }

        console.log(NubanGenerator.getCheckDigit(serialNumber, bankCode))

        return NubanGenerator.getCheckDigit(serialNumber, bankCode) == Number(accountNumber[9])
    }

    static generateNubans(nuban, bankCode) {

        if(!NubanGenerator.isValidNuban(nuban, bankCode)) {
            throw new Error('Nuban must be valid!')
        }

        const serialNumberInt =  Number(nuban.substring(0, 9));

        const previousSerialNumber = `${serialNumberInt - 1}`;
        const previousSerialNumberStr = previousSerialNumber.padStart(9, '0');
        
        
        const nextSerialNumber = `${serialNumberInt + 1}`;
        const nextSerialNumberStr = nextSerialNumber.padStart(9, '0');
    

        const previousNuban = `${previousSerialNumberStr}${NubanGenerator.getCheckDigit(previousSerialNumberStr, bankCode)}`;
        const nextNuban = `${nextSerialNumberStr}${NubanGenerator.getCheckDigit(nextSerialNumberStr, bankCode)}`;

        console.log(previousNuban, "....PREVIOUS NUBAN")
        console.log(nuban, "....NUBAN PASSED")
        console.log(nextNuban, ".....NEXT NUBAN")

        if(previousNuban.length !== 10 || nextNuban.length !== 10) {
            throw new Error('Nubans Generated must have a length of 10')
        }

        if(!NubanGenerator.isValidNuban(previousNuban, bankCode) || !NubanGenerator.isValidNuban(nextNuban, bankCode)) {
            throw new Error('Nubans Generated must be valid')
        }

        return [previousNuban, nuban, nextNuban];
    }
    
}

module.exports.NubanGenerator = NubanGenerator;

// console.log(NubanGenerator.generateNubans("0141072230", "058"));
