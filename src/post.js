
String.prototype.hashCode = function(){
  var hash = 0;
  for (var i = 0; i < this.length; i++) {
      var character = this.charCodeAt(i);
      hash = ((hash<<5)-hash)+character;
      hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

module.exports = class Post {
  constructor(msg) {
    if (typeof msg === 'string' || msg instanceof String) { // Message text
      this.text = msg
      this.timestamp = Date.now()
    } else { // An object with all properties
      const o = msg
      //this.id = o.id
      this.text = o.text
      this.timestamp = o.timestamp
    }
    this.id = (this.text + this.timestamp).hashCode()
  }

  asElement() {
    const post = document.createElement('div')
    const postId = document.createElement('p')
    postId.textContent = this.id
    const postTime = document.createElement('p')
    postTime.textContent = new Date(this.timestamp).toLocaleString()
    const postText = document.createElement('p')
    postText.textContent = this.text
    post.appendChild(postId)
    post.appendChild(postTime)
    post.appendChild(postText)
    post.id = 'post-' + this.id
    post.classList.add('post')
    return post
  }

  equals(other) {
    return this.id == other.id
  }
}