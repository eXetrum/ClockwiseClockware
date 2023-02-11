/*const RequireParams = params => async (req, res, next) => {
	console.log('[RequireParams]: ', params);
    const reqParamList = Object.keys(req.params);
    const hasAllRequiredParams = params.every(param =>
        reqParamList.includes(param)
    );
    if (!hasAllRequiredParams)
        return res
            .status(400)
			.json({ detail: `The following parameters are all required for this route: ${params.join(', ')}` });

    next();
};

const RequireBodyArgs = args => async (req, res, next) => {
    const reqArgList = Object.keys(req.body);
    const hasAllRequiredArgs = args.every(arg =>
        reqArgList.includes(arg)
    );
    if (!hasAllRequiredArgs)
        return res
            .status(400)
			.json({ detail: `The following body args are all required for this route: ${args.join(', ')}` });

    next();
};

module.exports = { RequireParams, RequireBodyArgs }
*/

const BodyParamsValidator = (Params) => async (req, res, next) => {
	for (let param of Params) {
		if (checkParamPresent(Object.keys(req.body), param)) {
			let reqParam = req.body[param.param_key];
			if (!checkParamType(reqParam, param)) {
				return res.status(400)
					.json({ detail: `${param.param_key} is of type ${typeof reqParam} but should be ${param.type}` });
			}
			for (let validator of param.validator_functions) {
				if (!validator.func(reqParam)) {
					return res.status(400).json({ detail: `${validator.errorText}` });
					//`Validation failed for ${param.param_key} => ${validator.errorText}` });
				}
			}
			/*if (!runValidators(reqParam, param)) {
				return res.status(400)
					.json({ detail: `Validation failed for ${param.param_key}` });
			}*/
		} else if (param.required){
			return res.status(400)
				.json({ detail: `Missing Parameter ${param.param_key}` });
		}
	}
	next();
};

const RouteParamsValidator = (Params) => async (req, res, next) => {
	for (let param of Params) {
		if (checkParamPresent(Object.keys(req.params), param)) {
			let reqParam = req.params[param.param_key];
			if (!checkParamType(reqParam, param)) {
				return res.status(400)
					.json({ detail: `${param.param_key} is of type ${typeof reqParam} but should be ${param.type}` });
			}
	
			for (let validator of param.validator_functions) {
				if (!validator.func(reqParam)) {
					return res.status(400).json({ detail: `${validator.errorText}` });
					//return res.status(400).json({ detail: `Validation failed for ${param.param_key} => ${validator.errorText}` });
				}
			}
			
		} else if (param.required){
			return res.status(400)
				.json({ detail: `Missing Parameter ${param.param_key}` });
		}
	}
	next();
};

const checkParamPresent = (reqParams, paramObj) => {
    return (reqParams.includes(paramObj.param_key));
};

const checkParamType = (reqParam, paramObj) => {
    const reqParamType = typeof reqParam;
	console.log('[checkParamType]: ', reqParam, paramObj, reqParamType);
    return reqParamType === paramObj.type;
};

const runValidators = (reqParam, paramObj) => {
	console.log('runValidators', reqParam, paramObj);
    for (let validator of paramObj.validator_functions) {
        if (!validator.func(reqParam)) {
            return false
        }
    }
    return true;
};

module.exports = { BodyParamsValidator, RouteParamsValidator };