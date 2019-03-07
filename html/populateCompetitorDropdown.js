document.objectsLoaded
  .then(function() {
    innerHTML = "<option value='-1'>Select User...</option>"
    let arr = [...document.users]
    arr.sort((a,b)=>{
      if(a.firstName==b.firstName)
        return 0
      if(a.firstName>b.firstName)
        return 1
      return -1
    })
    for (let i = 0; i < arr.length; i++) {
      const user = arr[i];
      innerHTML += `<option value="${user.id}">${user.firstName} ${user.lastName}</option>`
    }
    console.log(innerHTML)
    document.querySelectorAll("select.selectUser").forEach((el, i) => {
      el.innerHTML = innerHTML
    })
  })


