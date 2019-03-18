document.objectsLoaded = Promise.all([
  fetch("/data/users")
    .then(response => response.json())
    .then(function (data) {
      document.users = data
    }),
  fetch("/data/battles")
    .then(response=>response.json())
    .then(function (data){
      document.battles = data
    })
])
