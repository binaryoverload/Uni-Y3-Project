function permsNumToLetter(permissions) {
  if (typeof permissions !== "number") {
    throw new Error("Not a number")
  }

  console.log(permissions)
  console.log(permissions.toString(8))

  let perms = "rwxrwxrwx"
  for (let i = 0; i < perms.length; i++) {
    let bit = (perms.length - 1) - i
    if ((permissions & (1 << bit)) === 0) {
      console.log("blanked", i)
      perms = perms.substring(0, i) + "-" + perms.substring(i + 1)
    }
  }
  return perms;
}

module.exports = {
  permsNumToLetter
}
