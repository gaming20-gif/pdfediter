// Indian Currency Formatting (Grouping digits as xx,xx,xxx.xx)
export function formatIndianCurrency(num) {
    if (isNaN(num) || num === null || num === undefined) return "0.00";
    let str = parseFloat(num).toFixed(2);
    let parts = str.split(".");
    let rupees = parts[0];
    let paise = parts[1];
    
    if (rupees.length <= 3) {
        return rupees + "." + paise;
    }
    
    let lastThree = rupees.substring(rupees.length - 3);
    let rest = rupees.substring(0, rupees.length - 3);
    let restFormatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return restFormatted + "," + lastThree + "." + paise;
}

// Convert Number to Words (Indian Numbering System - Rupees & Paise)
export function convertNumberToWords(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) return "INR Zero Rupees Only.";
    
    let words = "";
    let parts = parseFloat(amount).toFixed(2).split(".");
    let rupees = parseInt(parts[0]);
    let paise = parseInt(parts[1]);

    if (rupees === 0) {
        words = "Zero Rupees";
    } else {
        words = numToWordsIndian(rupees) + " Rupees";
    }

    if (paise > 0) {
        words += " and " + numToWordsIndian(paise) + " Paise";
    }

    return "INR " + words + " Only.";
}

function numToWordsIndian(num) {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    function helper(n) {
        let str = "";
        if (n >= 100) {
            str += a[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n >= 20) {
            str += b[Math.floor(n / 10)] + " ";
            n %= 10;
        }
        if (n > 0) {
            str += a[n] + " ";
        }
        return str.trim();
    }

    let result = "";
    
    if (num >= 10000000) {
        result += helper(Math.floor(num / 10000000)) + " Crore ";
        num %= 10000000;
    }
    if (num >= 100000) {
        result += helper(Math.floor(num / 100000)) + " Lakh ";
        num %= 100000;
    }
    if (num >= 1000) {
        result += helper(Math.floor(num / 1000)) + " Thousand ";
        num %= 1000;
    }
    if (num > 0) {
        result += helper(num);
    }
    
    return result.trim().replace(/\s+/g, ' ');
}
