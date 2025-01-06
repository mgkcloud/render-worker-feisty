export function validateVideoRequest(input) {
  const errors = []
  
  if (!input.type || input.type !== 'image-video') {
    errors.push('Invalid type: only image-video is supported')
  }

  if (!input.data) {
    errors.push('Missing data object')
    return errors
  }

  const { voice_url, background_url, image_list, transcripts } = input.data

  if (!voice_url || typeof voice_url !== 'string') {
    errors.push('Invalid voice_url')
  }

  if (!background_url || typeof background_url !== 'string') {
    errors.push('Invalid background_url')
  }

  if (!Array.isArray(image_list) || image_list.length === 0) {
    errors.push('Invalid image_list')
  }

  if (!Array.isArray(transcripts) || transcripts.length === 0) {
    errors.push('Invalid transcripts')
  } else {
    transcripts.forEach((t, i) => {
      if (!t.words || typeof t.words !== 'string') {
        errors.push(`Transcript ${i} missing words`)
      }
      if (typeof t.start !== 'number' || typeof t.end !== 'number') {
        errors.push(`Transcript ${i} has invalid timestamps`)
      }
    })
  }

  return errors
}
