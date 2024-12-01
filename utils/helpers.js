function mergeList(list, product, qty) {
    const existingItem = list.find((item) => item.sku === product.sku);
    if (existingItem) {
        existingItem.qty += qty;
        existingItem.subtotal = existingItem.price * existingItem.qty;
    } else {
        list.push(product);
    }
    return list;
}

function calcTotal(list) {
    return list.reduce((total, item) => total + item.subtotal, 0);
}

function calcTax(total) {
    return total - total / 1.2;
}

module.exports = { mergeList, calcTotal, calcTax };
