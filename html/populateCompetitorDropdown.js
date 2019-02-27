fetch("/data/users")
  .then((response) => {
    return response.json()  
  })
  .then((json) => {
    innerHTML = "<option>Select User...</option>"
    json.sort((a,b)=>{
      if(a.firstName==b.firstName)
        return 0
      if(a.firstName>b.firstName)
        return 1
      return -1
    })
    for (let i = 0; i < json.length; i++) {
      const user = json[i];
      innerHTML += `<option value="${user.id}">${user.firstName} ${user.lastName}</option>`
    }
    console.log(innerHTML)
    document.querySelectorAll("select.selectUser").forEach((el, i) => {
      el.innerHTML = innerHTML
    })
  })