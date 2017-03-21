import React from 'react'

export default function({ path, toggle }) {
    if(path.length < 1 || !toggle)
        return null
    const title = path[path.length-1]

    return <div className="capsule" onClick={toggle}>
      <div className="title">
        { title }
      </div>
    </div>
}
