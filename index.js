    async function login(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.get('email'),
          password: formData.get('password')
        })
      });
      var data = await response.json();
      if(data.ok){
        window.location.href = '/dashboard';
      }
      else{
        window.location.href = '/signup';
      }
    }