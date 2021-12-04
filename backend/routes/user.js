const { Router } = require("express")

const config = require("../utils/config")
const { checkValidationErrors, respondFail } = require("../utils/http")


const router = Router()