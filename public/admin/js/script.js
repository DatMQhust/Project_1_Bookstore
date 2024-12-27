// Search
// const formSearch = document.querySelector("[form-search]")
// if(formSearch){
//     let url = new URL(window.location.href) 
//     formSearch.addEventListener("submit",(e)=>{
//         e.preventDefault()
//         let search = e.target.elements.search.value
//         console.log(search)
//         if(search){
          
//             url.searchParams.set("search",search)
        
//       }
//         else{
//             url.searchParams.delete("search")
//         }
//         window.location.href=url.href
//     })

// }
// Pagination
const listBtn = document.querySelectorAll("[button-pagination]")
if(listBtn){
    let url = new URL(window.location.href)
    listBtn.forEach(btn=>{
        btn.addEventListener("click",()=>{
            const page = btn.getAttribute("button-pagination")
           if (page){
            url.searchParams.set("page",page)
           }
              else{
                url.searchParams.delete("page")
              }
              location.href = url.href;
        })
    })
    const pageCurrent = url.searchParams.get("page") || 1;
  const buttonCurrent = document.querySelector(`[button-pagination="${pageCurrent}"]`);
  if(buttonCurrent) {
    buttonCurrent.parentNode.classList.add("active");
  }
}

// Preview ảnh
const uploadImage = document.querySelector("[upload-image]");
if(uploadImage) {
  const uploadImageInput = uploadImage.querySelector("[upload-image-input]");
  const uploadImagePreview = uploadImage.querySelector("[upload-image-preview]");

  uploadImageInput.addEventListener("change", () => {
    const file = uploadImageInput.files[0];
    if(file) {
      uploadImagePreview.src = URL.createObjectURL(file);
    }
  });
}
// Hết Preview ảnh