Use npm install. 
Just deploy your cloud firebase functions and get deployed url: cmd: firebase deploy

Used that url to make a post request for e.g: // emailNotification(data:any){ // return this.http.post(${environment.firebaseFunctionUrl}/sendEmail, // { // data1:data // } // ) // }