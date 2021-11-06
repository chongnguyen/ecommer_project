const Product = require('../models/product.model');
const initProductData = require('./crwalData');

module.exports.index = async (req, res) => {
    const LIMIT_ITEMS = 50;
    let { keyword = '' } = req.query,
        genre = req.params.genre,
        address = req.params.address,
        { kind = '' } = req.query,
        objFind = {};
    const options = {
        sort: {
            date: -1,
        },
        page: req.query.page || 1,
        limit: LIMIT_ITEMS,
    };

    genre = genre ? genre.replace(/-/gm, ' ') : '';
    address = address ? address.replace(/-/gm, ' ') : '';

    // keyword && (objFind.name = new RegExp(keyword, 'i'));
    genre && (objFind.genres = genre);
    address && (objFind.address = address);

    if (keyword) {
        objFind.$text = { $search: keyword };
        // objFind.score = { $meta: "textScore" };
        options.sort = { score: { $meta: 'textScore' } };
    }

    if (kind) {
        const sort = {};
        if (kind === 'price') sort.price = 1;
        else if (kind === 'new') sort.date = -1;
        else if (kind === 'descprice') sort.price = -1;
        options.sort = sort;
    }
    const products = await Product.paginate(objFind, options);
    let genres = await Product.distinct('genres');
    let add = await Product.distinct('address');

    const {
        docs,
        page,
        nextPage,
        hasNextPage,
        prevPage,
        hasPrevPage,
        totalDocs,
        totalPages,
    } = products;
    const pages = calculatePaginate(totalPages, page);

    res.render('layouts/common', {
        products: docs,
        genres,
        address: add,
        pages,
        active: page, // current page
        nextPage, // number
        hasNextPage, // boolean
        prevPage,
        hasPrevPage,
        keyword,
        kind: genre,
        province: address, // current address filter
        totalDocs,
        totalPages,
    });
};

module.exports.detail = async (req, res) => {
    let id = req.params.idProduct.slice(-24);
    let product = await Product.findOne({ _id: id });
    let { genres, shopId } = product;
    let similarProducts = await Product.find({
        $or: [{ genres }, { shopId }],
    }).limit(12);

    res.render('products/detail', {
        product,
        similarProducts,
    });
};

function pagination(products, pageCurrent = 1) {
    let n = 30; // total product on the page.
    let start = (pageCurrent - 1) * n;
    let end = pageCurrent * n;
    let totalPage = products.length / n;
    let temp = 0;
    let arr = [];
    for (let i = 0; i < totalPage; i++) {
        arr.push(++temp);
    }
    return { start, end, arr, temp, pageCurrent };
}

const calculatePaginate = function (totalPage, currentPage) {
    let pages = [];
    if (totalPage <= 5) {
        let start = 1;
        while (start <= totalPage) {
            pages.push(start);
            start++;
        }
        return pages;
    }
    if (currentPage < 5) {
        return [1, 2, 3, 4, 5];
    }

    if (currentPage === totalPage) {
        let start = currentPage - 4;
        while (start <= totalPage) {
            pages.push(start);
            start++;
        }
        return pages;
    }

    let start = currentPage - 3;
    while (start <= currentPage + 1) {
        pages.push(start);
        start++;
    }

    return pages;
};
module.exports.calculatePaginate = calculatePaginate;
