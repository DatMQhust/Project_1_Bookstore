module.exports =(query,total)=>{
    let page = 1;
    let limit = 4;
    if (query.page){
        page = parseInt(query.page)
    }
    if (query.limit){
        limit = parseInt(query.limit)
    }
    const offset = (page-1)*limit
    const totalPage = Math.ceil(total/limit)
    return {page,limit,offset,totalPage}
}