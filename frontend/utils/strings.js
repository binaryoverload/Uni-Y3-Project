function permsNumToLetter(permissions) {
  let perms = permissions
  if (typeof perms === "undefined") {
    return "---------"
  }

  if (typeof perms === "string") {
    perms = parseInt(permissions)
  }

  if (typeof perms !== "number") {
    throw new Error("Not a number")
  }

  let permString = "rwxrwxrwx"
  for (let i = 0; i < permString.length; i++) {
    let bit = (permString.length - 1) - i
    if ((permissions & (1 << bit)) === 0) {
      permString = permString.substring(0, i) + "-" + permString.substring(i + 1)
    }
  }
  return permString;
}

module.exports = {
  permsNumToLetter
}
