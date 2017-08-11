require('es6-promise').polyfill()

/**
 * Takes a timestamp formatted hh:mm:ss:MMM or mm:ss:MMM and returns value in seconds
 * @param  {string} timestamp Timestamp
 * @return {number}           Value in seconds
 *
 */
const convertTimeStampToSeconds = (timestamp) => {
  const reversed = timestamp.split('').reverse().join('')
  const regexp   = /(\d\d\d)\.(\d\d)\:(\d\d)(?::(\d\d))?/
  const matches  = reversed.match(regexp)

  if(!matches || matches.length < 3) throw new Error(`Badly formatted timestamp: ${timestamp}`)

  const s = matches[2].split('').reverse().join('')
  const m = matches[3].split('').reverse().join('')
  const h = matches[4] ? matches[4].split('').reverse().join('') : 0

  return parseInt(s) + (parseInt(m) * 60) + (parseInt(h) * 60 * 60)
}

/**
 * Returns every caption of a video with start and end timestamps
 * @param  {[type]} source [description]
 * @return {[type]}        [description]
 */
const parseCaptions = (source) => {
  const regexp     = /(?:\d\d:)?\d\d:\d\d.\d\d\d \-\-\> (?:\d\d:)?\d\d:\d\d.\d\d\d\n(?:.*)/g
  const matches    = transcript.match(regexp)
  const timestamps = []

  if(!matches) throw new Error(`Transcript does not contain properly formatted captions`)

  matches.map(match => {
    const subregexp = /((?:\d\d:)?\d\d:\d\d.\d\d\d) \-\-\> ((?:\d\d:)?\d\d:\d\d.\d\d\d)\n(.*)/
    const submatches = match.match(subregexp)

    const text  = submatches[3]
    const start = convertTimeStampToSeconds(submatches[1])
    const end   = convertTimeStampToSeconds(submatches[2])

    timestamps.push({ text, start, end })

  })
  console.log(timestamps)
  return timestamps

}

/**
 * Wraps the instantiation of an AblePlayer object to provide an interface for triggering
 * an arbitrary callback upon successful initialization of the AblePlayer object.
 *
 * Returns a promise with the AblePlayer instance as the sole argument OR an error code.
 *
 * Can accept either a string or an AblePlayer instance as an argument.
 * If a string is provided, it will be used as a selector for initializing AblePlayer.
 * If an AblePlayer instance is provided, it will be re-used.
 *
 * Must be called after both jQuery and AblePlayer itself are loaded.
 *
 * @param  {string|AblePlayer}   player Selector to be used in creating AblePlayer object OR pre-existing AblePlayer instance.
 * @return {Promise}
 */
const ableplayerPlugin = (player) => {
  return new Promise((resolve, reject) => {
    if(typeof AblePlayer === 'undefined'){
      reject('Load AblePlayer script before declaring plugins.')
    }

    if(typeof $ === 'undefined'){
      reject('Load jQuery before declaring plugins.')
    }

    const AP = (typeof player === 'object') ?
      player :
      new AblePlayer($(player))

    const timeout = setTimeout(() => {
      reject('Player did not instantialize')
    }, 10000)

    const checkForInitialization = setInterval(() => {
      if(typeof AP.initializing === 'undefined') return
      clearInterval(checkForInitialization)
      resolve(AP)
    }, 100)
  })
}

/**
 * Attaches a keyup listener to a search bar that parses a video transcript and adds indicators where the value of the search appears in the transcript text
 */
window.ableplayerSearch = (player, searchbar, sources, opts = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const defaultOpts = {

      }

      const mergedOpts = Object.assign({}, defaultOpts, opts)

      ableplayerPlugin(player)
      .then(player => {

        const $player    = player.$ableDiv
        const $searchbar = $(searchbar)
        const $seekbar   = $player.find('.able-seekbar')
        const captions   = []
        //const duration   = player.media.duration // This breaks for YouTube videos

        const duration = 3856

        if(typeof sources === 'array'){
          sources.map(source => {
            captions.push(...parseCaptions(source))
          })
        } else {
          captions.push(...parseCaptions(sources))
        }

        $searchbar.on('keyup', function(){
          $('.able-indicator').remove()

          const val = $(this).val().toUpperCase()

          if(val.length < 3) return

          const matches = captions.filter(caption => {
            const uc = caption.text.toUpperCase()
            return uc.includes(val)
          })

          matches.map(match => {
            const { text, start, end } = match
            const $dot = $(`<div class="able-indicator"></div>`)

            $dot.css({
              top: 0,
              position:     'absolute',
              left:         (start / duration * 100) + '%',
              width:        ((end - start)) / 10 + '%',
              height:       '6px',
              borderRadius: '100%',
              background:   'yellow',
              minWidth:     '6px'
            })

            $seekbar.append($dot)

          })
        })

        resolve(player)
      })
    } catch(e) {
      reject(e)
    }
  })
}
