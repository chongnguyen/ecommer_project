const chrome = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver');
const fetch = require('node-fetch');
const Product = require('../models/product.model');

const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36';

const options = new chrome.Options();
options.addArguments('headless'); // note: without dashes
options.addArguments('disable-gpu');
options.addArguments([`user-agent="${USER_AGENT}"`]);

module.exports.initProductData = async (req, res) => {
    console.log(req.body)
    const { keys } = req.body;
    let shopId = req.signedCookies.userId;
    console.log({ keys });
    console.log({ shopId });
    const chromePath = require('chromedriver').path;
    const service = new chrome.ServiceBuilder(chromePath).build();
    chrome.setDefaultService(service);

    const driver = new webdriver.Builder()
        .forBrowser('chrome')
        .withCapabilities(webdriver.Capabilities.chrome())
        .setChromeOptions(options) // note this
        .build();
    try {
        let uris = [];
        for (const key of keys) {
            const uri = `https://shopee.vn/search?keyword=${key}&noCorrection=true&preferred=true`;
            console.log({ uri });
            await driver.get(uri);
            await driver.wait(async function () {
                return driver
                    .executeScript('return document.readyState')
                    .then(function (readyState) {
                        return readyState === 'complete';
                    });
            });
            await driver.sleep(1000);

            urls = await driver.executeScript(`
                const links = [];
                window.scrollTo({left: 0, top:document.body.scrollHeight, behavior: 'smooth'});
                function sleep(ms) {
                    return new Promise((resolve) => setTimeout(() => {
                        window.scrollTo({left: 0, top:document.body.scrollHeight / 3, behavior: 'smooth'});
                        console.log('done');
                        resolve('done');
                    }, ms));
                }
                await sleep(6000);
                const items = document.getElementsByClassName('shopee-search-item-result__item');
                for (const item of items) {
                    const { href } = item.firstElementChild || {};
                    if (!href) continue;
                    links.push(href);
                }
                return links;
            `);
            uris.push(...urls);
        }
        
        const products = [];
        for (const link of uris) {
            console.log({ link });
            await driver.get(link);
            const complete = await driver.wait(async function () {
                return driver
                    .executeScript('return document.readyState')
                    .then(function (readyState) {
                        return readyState === 'complete';
                    });
            });
            console.log({ complete });
            await driver.sleep(1000);

            const product = await driver.executeScript(`
                window.scrollTo({left: 0, top:document.body.scrollHeight, behavior: 'smooth'});
                function sleep(ms) {
                    return new Promise((resolve) => setTimeout(() => {
                        window.scrollTo({left: 0, top:document.body.scrollHeight / 3, behavior: 'smooth'});
                        resolve('done');
                    }, ms));
                }
                await sleep(1000);
                const priceText = document.querySelector('._3e_UQT')?.textContent || "₫520.000";
                const oldPriceText = document.querySelector('._28heec')?.textContent;
                const price = priceText?.slice(priceText.lastIndexOf('₫') + 1).split('.').join('');
                if(oldPriceText){
                    oldPrice = oldPriceText?.slice(oldPriceText.lastIndexOf('₫') + 1).split('.').join('');
                } else {
                    oldPrice = price;
                }
                const product = {
                    name: document.querySelector('.attM6y')?.lastElementChild.innerText,
                    oldPrice,
                    price,
                    quantum: document.querySelector('._16mL_A.shopee-input-quantity')?.parentElement.nextElementSibling?.textContent.split(' ')[0] || 100,
                    genres: document.querySelector('.page-product__breadcrumb')?.childNodes[2]?.textContent ||'Other',
                    description: document.querySelector('._3yZnxJ')?.textContent,
                    image: document.querySelector('._12uy03._2GchKS')?.style.backgroundImage?.slice(4, -1),
                    date: new Date(),
                }
                return product;
            `);
            console.log('clone product: ' + product.name);
            products.push({ ...product, shopId });
        }
        await Product.insertMany(products);
        console.log('Done')
        const resultData = {
            success: true,
            msg: 'init data successfully!',
            payload: products.length,
        };
        res.end(JSON.stringify(resultData))
        return resultData;
    } catch (e) {
        console.log('cant init data');
        console.log(e);
        return e;
    } finally {
        await driver.quit();
        res.end();
    }
    
};

// module.exports.initProductDataV2 = async (shopId) => {
//     const keywords = [
//         'chan vay',
//         'dam',
//         'ban phim co',
//         'macbook',
//         'ghe gaming',
//     ];
//     for(const key of keywords){
//         const url = `https://shopee.vn/search?keyword=${key}&noCorrection=true&preferred=true`;
//         const products = [];

//         const shoppeProducts = await getProducts(url);
//         // const ProductSchema = new mongoose.Schema({
//         //     name: String,
//         //     price: Number,
//         //     description: String,
//         //     image: String,
//         //     oldPrice: Number,
//         //     genres: String,
//         //     quantum: Number,
//         //     sku: String,
//         //     shopId: String,
//         //     date: Date
//         //   });
//         for(const foundProduct of shoppeProducts.items){
//             const product = {};
//             const { 
//                 name, price, 
//                 price_before_discount: oldPrice, 
//                 genres, 
//                 image, 
//                 stock: quantum,
//                 description,
//                 itemid: sku,
//             } = product;
//         }
//     }
// }
// async function getProducts(url) {
//     const result = await fetch(url);
//     return result.json();
// }