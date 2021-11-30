const { Router } = require("express")

const config = require("../config")
const { checkValidationErrors, respondFail } = require("../utils/http")


const router = Router()