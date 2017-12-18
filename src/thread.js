const swarm = require('webrtc-swarm')
const signalhub = require('signalhub')
const Post = require('./post.js')

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

module.exports = class Thread {
  constructor(threadId) {
    this.id = threadId ? threadId : uuidv4()
    console.log("Instantiating a Thread", this.id)
    this.posts = []
    let hub = signalhub('dib-thread-' + threadId, 'https://signalhub-jccqtwhdwc.now.sh')
    this.swarm = swarm(hub)
    this.swarm.on('connect', (peer, id) => {
      peer.on('data', rawData => {
        console.log("Got data", id, rawData, rawData.toString())
        const data = JSON.parse(rawData.toString())
        if (data.type && data.type === 'post') {
          this.addPost(new Post(data.contents))
        }
      })
      if (this.onNewPeer) this.onNewPeer(peer, id)
    })
    this.swarm.on('disconnect', (peer, id) => {
      if (this.onLostPeer) this.onLostPeer(peer, id)
    })
  }

  post(msg) {
    console.log("Posting ", msg)
    let toPost = null
    if (typeof msg === 'string' || msg instanceof String) {
      toPost = new Post(msg)
    } else {
      toPost = msg
    }
    this.posts.push(toPost)
    this.swarm.peers.forEach(peer => {
      peer.send(JSON.stringify({
        type: 'post',
        contents: toPost,
      }))
    })
    console.log(this.onPostsChanged)
    if (this.onPostsChanged) this.onPostsChanged(toPost)
  }

  addPost(newPost) {
    // first post
    if (this.posts.length === 0) {
      this.posts.push(newPost)
    } else {
      const time = newPost.timestamp
      let added = false
      for (let cur = 0; cur < this.posts.length - 1; cur++) {
        if (this.posts[cur].timestamp < time && time < this.posts[cur + 1].timestamp) {
          this.posts.splice(cur, 0, newPost)
          added = true
        }
      }
      if (!added) {
        this.posts.push(newPost)
      }
    }
    if (this.onPostsChanged) this.onPostsChanged(newPost)
  }

  asElement() {
    const container = document.createElement('div')
    this.posts.forEach(p => {
      container.appendChild(p.asElement())
    })
    console.log(container)
    return container
  }
}