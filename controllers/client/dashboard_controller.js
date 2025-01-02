const search = require('../../helpers/search');
const pageHelper = require('../../helpers/pagination');
const db = require('../../config/databaseMySQL');
const {addRecentActivity} = require('../admin/dashboard_controller')
module.exports.index = async (req,res) => {
    const [category] = await db.execute('select * from category')
    const [rows] = await db.execute(`
        SELECT category.name, COUNT(product.categoryID) AS 'Số lượng sách'
        FROM category
        LEFT JOIN product ON category.categoryID = product.categoryID
        GROUP BY category.categoryID;
    `);
    const numberBooks = rows.map(row => row['Số lượng sách']);
    const [newproduct] = await db.execute('select * from product where status = "active" order by created_at desc limit 10')
    const [product] = await db.execute('select * from product where status = "active" order by watched desc limit 10')
    res.render('client/page/home/index',{
        trendproduct:product,
        newproduct:newproduct,
        category:category,
        numberBook: numberBooks
    })
}
// [GET] /list/:type
module.exports.list = async (req, res) => {
    const type = req.params.type;
    const sort = req.query.sort; // Lấy query 'sort' từ URL
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM product WHERE status = "active"');
    const count = countResult[0].total;
    const { page, limit, offset, totalPage } = pageHelper(req.query, count);
    let userID = null;
    if (req.user) {
        userID = req.user.userID;
    }

    let sortQuery = "";
    if (sort === "year") {
        sortQuery = "ORDER BY publish_year DESC";
    } else if (sort === "price-asc") {
        sortQuery = "ORDER BY price ASC";
    } else if (sort === "price-desc") {
        sortQuery = "ORDER BY price DESC";
    } else {
        sortQuery = type === "trend" ? "ORDER BY watched DESC" : "ORDER BY created_at DESC";
    }

    const [product] = await db.execute(
        `SELECT p.*, 
                CASE WHEN l.productID IS NOT NULL THEN true ELSE false END AS isLiked
         FROM product p
         LEFT JOIN liked l ON p.productID = l.productID AND l.userID = ?
         WHERE p.status = "active"
         ${sortQuery}
         LIMIT ? OFFSET ?`,
        [`${userID}`, `${limit}`, `${offset}`]
    );

    res.render('client/page/home/list', {
        products: product,
        totalPage: totalPage,
        currentPage: page,
    });
};

module.exports.listCategory = async (req, res) => {
    const id = req.params.id;
    const sort = req.query.sort; // Lấy query 'sort' từ URL

    let sortQuery = "";
    if (sort === "year") {
        sortQuery = "ORDER BY publish_year DESC";
    } else if (sort === "price-asc") {
        sortQuery = "ORDER BY price ASC";
    } else if (sort === "price-desc") {
        sortQuery = "ORDER BY price DESC";
    }

    const [countResult] = await db.execute(
        'SELECT COUNT(*) as total FROM product WHERE status = "active" AND categoryID = ?',
        [id]
    );
    const count = countResult[0].total;
    const { page, limit, offset, totalPage } = pageHelper(req.query, count);

    const [product] = await db.execute(
        `SELECT * FROM product 
         WHERE status = "active" AND categoryID = ? 
         ${sortQuery}
         LIMIT ? OFFSET ?`,
        [id, `${limit}`, `${offset}`]
    );
    
    res.render('client/page/home/list', {
        products: product,
        totalPage: totalPage,
        currentPage: page,
    });
};

module.exports.filterPost = async (req,res) =>{
    var { categories: category, priceFrom, priceTo, year, likes: like, languages:language } = req.query;
    var cate = category ? category.split(',') : [];
    var query = `select * from product where 1 = 1 `;
    var params = [];
    if (cate.length === 0) {
        const [id] = await db.execute('select categoryID from category');
        cate = id.map(item => item.categoryID);

    }
    cate.map((item, index) => {
        cate[index] = parseInt(item);
    });
    const placeHodercat = cate.map(() => '?').join(',');
    query += `and categoryID in (${placeHodercat})`;
    params.push(...cate);
    var lang = language ? language.split(',') : [];
    if (lang.length === 0) {
        lang = ['Tiếng Việt','Tiếng nước ngoài']
    }
    const placeHolderlang = lang.map(() => '?').join(',');
    query += `and language in (${placeHolderlang})`;
    params.push(...lang);
    priceFrom = parseInt(priceFrom);
    priceTo = parseInt(priceTo);
    if (priceFrom > 0 && priceTo > 0 && priceFrom < priceTo) {
        query += `and price >= ? and price <= ?`;
        params.push(priceFrom, priceTo);
    }
    year = parseInt(year);
    if (year > 2021) {
        query += `and publish_year = ?`;
        params.push(year);
    }
    else if (year == 2021) {
        query += `and publish_year <= ?`;
        params.push(year);
    }
    like = parseInt(like);
    if (like  == 10){
        query += `and watched <= ?`;
        params.push(like);
    }
    else if (like == 20){
        query += `and watched >= ? and watched <= ?`;
        params.push(like - 10, like);
    }
    else if (like == 50){
        query += `and watched >= ? and watched <= ?`;
        params.push(like - 30, like);
    }
    else if (like == 51){
        query += `and watched > ?`;
        params.push(50);
    }
    if(req.query.sort){
        const sort = req.query.sort;
        if (sort === "year") {
            query += ` ORDER BY publish_year DESC`;
        } else if (sort === "price-asc") {
            query += ` ORDER BY price ASC`;
        } else if (sort === "price-desc") {
            query += ` ORDER BY price DESC`;
        }
    }
    const [product] = await db.execute(query, params);
    const count = product.length;
    const {page,limit,offset,totalPage} = pageHelper(req.query,count)
    res.render('client/page/home/list',{
        products:product,
        totalPage: totalPage,
        currentPage: page
    })
}
module.exports.searchPost = async (req, res) => {
    const content = req.query.query;
    const sort = req.query.sort; // Lấy query 'sort' từ URL
    const searchContent = `%${content}%`;

    let query = `
        SELECT product.*, 
               GROUP_CONCAT(author.name SEPARATOR ', ') AS authors 
        FROM product 
        JOIN productauthor ON product.productID = productauthor.productID 
        JOIN author ON productauthor.authorID = author.authorID 
        WHERE (product.name LIKE ? OR author.name LIKE ?)
        GROUP BY product.productID
    `;
    let params = [searchContent, searchContent];

    // Thêm logic sắp xếp
    if (sort === "year") {
        query += ` ORDER BY publish_year DESC`;
    } else if (sort === "price-asc") {
        query += ` ORDER BY price ASC`;
    } else if (sort === "price-desc") {
        query += ` ORDER BY price DESC`;
    }

    const [product] = await db.execute(query, params);
    const count = product.length;
    const { page, limit, offset, totalPage } = pageHelper(req.query, count);

    res.render('client/page/home/list', {
        products: product,
        totalPage: totalPage,
        currentPage: page,
    });
};
module.exports.notFound = (req,res) =>{
    res.render('client/page/404');
}