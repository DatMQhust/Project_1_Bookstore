module.exports = (query)=>{
    let keyword = query.search;
    const regex = new RegExp(keyword,'i')
    return regex
}