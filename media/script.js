document.getElementById('btn-login').onclick = function(){
  localStorage.setItem('token', document.getElementById('token').value);
  location.reload()
}
if (!localStorage.getItem('token')) {
  document.getElementById('login').showModal();
} else {}