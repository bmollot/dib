const diffDOM = require('diff-dom')
const Thread = require('./thread.js')

const dd = new diffDOM()
let currentThread = null
let prevThreadElem = null

const updatePeerDisplay = () => {
    document.getElementById('peer-count-display').textContent = currentThread ? currentThread.swarm.peers.length : "No thread"
}

const clearPosts = () => {
    const posts = document.getElementsByClassName('post')
    for (let i = 0; i < posts.length; i++) {
        posts[i].parentNode.removeChild(posts[i])
    }
}

const joinThread = threadId => {
    if (currentThread) delete currentThread
    clearPosts()
    currentThread = new Thread(threadId)
    currentThread.onNewPeer = (peer, id) => {
        console.log("New peer", id)
        peer.send(JSON.stringify(currentThread.posts))
        updatePeerDisplay()
    }
    currentThread.onLostPeer = (peer, id) => {
        console.log("Lost peer", id)
        updatePeerDisplay()
    }
    currentThread.onPostsChanged = () => {
        currThreadElem = currentThread.asElement()
        const diff = dd.diff(prevThreadElem, currThreadElem)
        dd.apply(prevThreadElem, diff)
        prevThreadElem = document.getElementById('thread-container').children[0]
    }
    updatePeerDisplay()
    document.getElementById('thread-id-display').textContent = currentThread.id
}

const makeThread = joinThread

const makePost = msg => {
    currentThread.post(msg)
}

document.body.onload = () => {
    const tscButton = document.getElementById('toggle-swarm-control-button')
    tscButton.onclick = () => {
        if (tscButton.clicked) {
            tscButton.clicked = false
            document.getElementById('swarm-control').style.display = 'none'
            document.getElementById('tsc-button-status').textContent = "Show"
        } else {
            tscButton.clicked = true
            document.getElementById('swarm-control').style.display = 'block'
            document.getElementById('tsc-button-status').textContent = "Hide"
        }
    }
    document.getElementById('join-swarm-button').onclick = () => {
        let swarmId = document.getElementById('join-swarm-box').value
        joinSwarm(swarmId)
    }
    document.getElementById('new-thread-button').onclick = () => makeThread()
    document.getElementById('join-thread-button').onclick = () => {
        let threadId = document.getElementById('join-thread-box').value
        joinThread(threadId)
    }
    document.getElementById('reply-button').onclick = () => {
        let replyText = document.getElementById('reply-entry').value
        document.getElementById('reply-entry').value = ""
        makePost(replyText)
    }
    prevThreadElem = document.getElementById('thread-container').children[0]
}