// Search
const formSearch = document.querySelector("[form-search]")
if(formSearch){
    let url = new URL(window.location.href)
    formSearch.addEventListener("submit",(e)=>{
        e.preventDefault()
        let search = e.target.elements.search.value
        console.log(search)
        if(search){
            url.searchParams.set("search",search)
        }
        else{
            url.searchParams.delete("search")
        }
        window.location.href=url.href
    })

}