function clamp(func, limits) {
    const defaultVals = { minY: null, maxY: null, underflowVal: null, overflowVal: null, overflowInclude: false, underflowInclude: true };
    const { minX, maxX, minY, maxY, underflowVal, overflowVal, overflowInclude, underflowInclude } = { ...defaultVals, ...limits };
    return (x) => {
        let result;
        if (minX != null && (underflowInclude ? x <= minX : x < minX))
            result = underflowVal != null ? underflowVal : func(minX);
        else if (maxX != null && (overflowInclude ? x >= maxX : x > maxX))
            result = overflowVal != null ? overflowVal : func(maxX);
        else if (minY != null && result < minY)
            result = minY;
        else if (maxY != null && result > maxY)
            result = maxY;
        else
            result = func(x);
        return result;
    };
};
/**
    * @typedef {Object} MathFunctionParams
    * @property {number} minX - Minimum x value.
    * @property {number} maxX - Maximum x value.
    * @property {number} minY - Minimum y value.
    * @property {number} maxY - Maximum y value.
    * @property {number} underflowVal - Value returned when x is less than minX.
    * @property {number} overflowVal - Value returned when x is greater than maxX.
    * @property {boolean} underflowInclude - If true, x can be equal to minX.
    * @property {boolean} overflowInclude - If true, x can be equal to maxX.
    * @property {any} meta - Hint to identify the type of function.
    * @property {string} exp - Expression that defines the function.
    * @property {string} intraChildOperator - Operator between childs.
    * @property {string} interChildOperator - Operator between childs and parent.
    * @property {MathFunctionParams[]} childs - Child Functions.
*/
export class MathFunction {

    #minX;
    #maxX;
    #minY;
    #maxY;
    #underflowVal;
    #overflowVal;
    #exp;
    #intraChildOperator;
    #interChildOperator;
    #childs;
    #func;

    #meta;

    /**
        * New MathFunction.
        * @param {MathFunctionParams} params - MathFunctionParams object.
        * @returns {function(number): number}
     */
    #build = (params) => {

        const buildFunc = (params) => {
            const { exp, childs, intraChildOperator, interChildOperator } = params;
            const indepententVar = 'x';
            const operators = ['+', '-', '*', '/', '%', '&', '|', '^', '~'];
            const funcs = Object.getOwnPropertyNames(Math).filter(name => typeof Math[name] === 'function');
            const constants = Object.getOwnPropertyNames(Math).filter(name => typeof Math[name] === 'number');
            const specialChars = ['(', ')', ',', ...operators, indepententVar];

            const buildChildsFunc = (childs, intraChildOperator = '+') => {
                if (!operators.includes(intraChildOperator)) throw new Error('Invalid intraChildOperator: ' + intraChildOperator);
                const childsFunc = childs.map(child => clamp(
                    buildFunc(child),
                    child
                ));
                return x => childsFunc.reduce((p, foo) => eval(`${p} ${intraChildOperator} ${foo(x)}`), 0);
            };

            //Validates y sanitizes 
            const tokenize = (exp) => {
                exp = exp.replace(/ /g, ''); //Removes empty espaces
                let tokens = [];
                let token = '';
                for (let i = 0; i < exp.length; i++) {
                    const number = token ? Number(token) : NaN;
                    if (!isNaN(number) && isNaN(Number(token + exp[i]))) {
                        tokens.push(number);
                        token = '';
                    };
                    token += exp[i];
                    if (specialChars.includes(token)) {
                        tokens.push(token);
                        token = '';
                    }
                    else if (!isNaN(token) && i === exp.length - 1) {
                        tokens.push(Number(token));
                    }
                    else {
                        if (funcs.includes(token) || constants.includes(token)) {
                            tokens.push(token);
                            token = '';
                        }
                        else if (isNaN(Number(token)) && !funcs.some(f => f.includes(token)) && !constants.some(c => c.includes(token))) {
                            throw new Error('Invalid token: ' + token);
                        }
                    }
                };
                tokens = tokens.map(t => (funcs.includes(t) || constants.includes(t)) ? 'Math.' + t : t);
                return tokens;
            };

            //Evals the expression, throws an error if theres a syntaxis error
            const buildExp = (tokens, childsFunc, interChildOperator = '+') => {
                const expression = tokens.join('');
                let func = eval(`${indepententVar} => ${expression}`);
                if (childsFunc) {
                    if (!operators.includes(interChildOperator)) throw new Error('Invalid interChildOperator: ' + interChildOperator);
                    return (x) => eval(`${func(x)} ${interChildOperator} ${childsFunc(x)}`);
                } else {
                    return func;
                }
            };

            const childsFunc = childs ? buildChildsFunc(childs, intraChildOperator) : null;
            const tokens = tokenize(exp);
            const func = buildExp(tokens, childsFunc, interChildOperator);

            return func;
        };

        const defaultVals = { exp: 'x' };
        const { minX, maxX, minY, maxY, underflowVal, overflowVal, exp, intraChildOperator, interChildOperator, childs } = { ...defaultVals, ...params };

        return clamp(
            buildFunc({ exp, childs, intraChildOperator, interChildOperator }),
            { minX, maxX, minY, maxY, underflowVal, overflowVal }
        );
    };

    /**
        * New MathFunction Object.
        * @param {MathFunctionParams} params - MathFunctionParams object.
     */
    constructor({ minX, maxX, minY, maxY, underflowVal, overflowVal, exp, intraChildOperator, interChildOperator, childs, meta }) {
        this.#minX = minX;
        this.#maxX = maxX;
        this.#minY = minY;
        this.#maxY = maxY;
        this.#underflowVal = underflowVal;
        this.#overflowVal = overflowVal;
        this.#exp = exp;
        this.#intraChildOperator = intraChildOperator;
        this.#interChildOperator = interChildOperator;
        this.#childs = childs;
        this.#func = this.#build({ minX, maxX, minY, maxY, underflowVal, overflowVal, exp, intraChildOperator, interChildOperator, childs });

        this.#meta = meta;
    };

    getMinX = () => this.#minX;
    getMaxX = () => this.#maxX;
    getMinY = () => this.#minY;
    getMaxY = () => this.#maxY;
    getUnderflowVal = () => this.#underflowVal;
    getOverflowVal = () => this.#overflowVal;
    getExp = () => this.#exp;
    getIntraChildOperator = () => this.#intraChildOperator;
    getInterChildOperator = () => this.#interChildOperator;
    getChilds = () => this.#childs;
    getFunc = () => ((x) => this.#func(x));

    getMeta = () => this.#meta;

    setMinX = (minX) => {
        this.#minX = minX;
        this.#func = this.#build({ exp: this.#exp, minX: this.#minX, maxX: this.#maxX, minY: this.#minY, maxY: this.#maxY, underflowVal: this.#underflowVal, overflowVal: this.#overflowVal });
    };
    setMaxX = (maxX) => {
        this.#maxX = maxX;
        this.#func = this.#build({ exp: this.#exp, minX: this.#minX, maxX: this.#maxX, minY: this.#minY, maxY: this.#maxY, underflowVal: this.#underflowVal, overflowVal: this.#overflowVal });
    };
    setMinY = (minY) => {
        this.#minY = minY;
        this.#func = this.#build({ exp: this.#exp, minX: this.#minX, maxX: this.#maxX, minY: this.#minY, maxY: this.#maxY, underflowVal: this.#underflowVal, overflowVal: this.#overflowVal });
    };
    setMaxY = (maxY) => {
        this.#maxY = maxY;
        this.#func = this.#build({ exp: this.#exp, minX: this.#minX, maxX: this.#maxX, minY: this.#minY, maxY: this.#maxY, underflowVal: this.#underflowVal, overflowVal: this.#overflowVal });
    };
    setUnderflowVal = (underflowVal) => {
        this.#underflowVal = underflowVal;
        this.#func = this.#build({ exp: this.#exp, minX: this.#minX, maxX: this.#maxX, minY: this.#minY, maxY: this.#maxY, underflowVal: this.#underflowVal, overflowVal: this.#overflowVal });
    };
    setOverflowVal = (overflowVal) => {
        this.#overflowVal = overflowVal;
        this.#func = this.#build({ exp: this.#exp, minX: this.#minX, maxX: this.#maxX, minY: this.#minY, maxY: this.#maxY, underflowVal: this.#underflowVal, overflowVal: this.#overflowVal });
    };
    setMeta = (meta) => {
        this.#meta = meta;
    };
    setExp = (exp) => {
        this.#exp = exp;
        this.#func = this.#build({ exp: this.#exp, minX: this.#minX, maxX: this.#maxX, minY: this.#minY, maxY: this.#maxY, underflowVal: this.#underflowVal, overflowVal: this.#overflowVal });
    };

    evaluate = (x) => this.#func(x);

    /**
     * New MathFunction.
     * @param {MathFunction} mathFunctionInstance - MathFunction object.
     * @returns {MathFunctionParams}
     */
    serialize = (mathFunctionInstance) => ({
        minX: this.#minX,
        maxX: this.#maxX,
        minY: this.#minY,
        maxY: this.#maxY,
        underflowVal: this.#underflowVal,
        overflowVal: this.#overflowVal,
        exp: this.#exp,
        intraChildOperator: this.#intraChildOperator,
        interChildOperator: this.#interChildOperator,
        childs: this.#childs,

        meta: this.#meta,
    });

};

export const MathFunctionsTemplates = (() => {

    /**
   * New Constant Function
   * @param {Object} params
   * @param {number} params.value - "value" is the value returned by the function.
   * @param {MathFunctionParams} mathFunctionParams
   * @returns {MathFunction}
  */
    const newConstant = ({ value }, mathFunctionParams) => new MathFunction({ exp: `${value}`, meta: { label: 'Constant', value }, ...mathFunctionParams });

    /**
     * New Line Function
     * @param {Object} params 
     * @param {number} params.a -  "a" is the slope of the line,
     * @param {number} params.b - "b" is the intercept.
     * @param {MathFunctionParams} mathFunctionParams
     * @returns {MathFunction}
    */
    const newLine = (params, mathFunctionParams) => {
        const defaultVals = { a: 0, b: 1 };
        const { a, b } = { ...defaultVals, ...params };
        return new MathFunction({ exp: `${a} * x + ${b}`, meta: { label: 'Line', a, b }, ...mathFunctionParams });
    };

    /**
     * New SmoothStep Function
     * @param {Object} params
     * @param {number} params.x0 - "x0" and "x1" are the x values of the function.
     * @param {number} params.x1 - "x0" and "x1" are the x values of the function.
     * @param {number} params.y0 - "y0" and "y1" are the values of the function at x0 and x1 respectively.
     * @param {number} params.y1 - "y0" and "y1" are the values of the function at x0 and x1 respectively.
     * @param {number} params.N - "N" is the degree of the polynomial (how smooth the step is).
     * @param {MathFunctionParams} mathFunctionParams
     * @returns {MathFunction}
    */
    const newSmoothStep = (params, mathFunctionParams) => {

        const defaultVals = { x0: 0, x1: 1, y0: 0, y1: 1, N: 1 };
        const { x0, x1, y0, y1, N } = { ...defaultVals, ...params };

        const pascalTriangle = (a, b) => `(${Array(b).fill().reduce((p, _, i) => p + `* (${(a - i) / (i + 1)})`, '1')})`;

        const exp = `(` + Array(N + 1).fill().reduce((p, _, i) =>
            p + `${i === 0 ? '' : '+'} ${pascalTriangle(-N - 1, i)} * ${pascalTriangle(2 * N + 1, N - i)} * pow(((x  - ${x0})/ (${x1 - x0})) , ${N + i + 1})`, '')
            + `)* (${y1 - y0}) + ${y0}`;

        return new MathFunction({ exp, meta: { label: 'Smoothstep', x0, x1, y0, y1, N }, minX: x0, maxX: x1, underflowVal: y0, overflowVal: y1, ...mathFunctionParams });
    };

    /**
     * New SmoothStep Function
     * @param {Object} params
     * @param {number} params.x0 - 
     * @param {number} params.x1 - 
     * @param {number} params.x2 - 
     * @param {number} params.y0 - 
     * @param {number} params.y1 - 
     * @param {number} params.y2 - 
     * @param {number} params.N1 - 
     * @param {number} params.N2 - 
     * @param {MathFunctionParams} mathFunctionParams
     * @returns {MathFunction}
    */
    const newSmoothStepBell = (params, mathFunctionParams) => {

        const defaultVals = { x0: 0, x1: 0.5, x2: 1, y0: 0, y1: 1, y2: 0, N1: 1, N2: 1, underflowVal: 0, overflowVal: 0 };
        params.minX = params.minX || params.x0 || defaultVals.x0;
        params.maxX = params.maxX || params.x2 || defaultVals.x2;
        const { x0, x1, x2, y0, y1, y2, N1, N2, minX, maxX, minY, maxY, underflowVal, overflowVal } = { ...defaultVals, ...params };

        const smoothStepA = newSmoothStep({ x0: x0, x1: x1, y0: y0, y1: y1, N: N1 }, { underflowVal, overflowVal }).serialize();
        const smoothStepB = newSmoothStep({ x0: x1, x1: x2, y0: y1, y1: y2, N: N2 }, { underflowVal, overflowVal }).serialize();
        const meta = { label: 'SmoothStepBell', x0, x1, x2, y0, y1, y2, N1, N2 };
        const exp = `0`;
        return new MathFunction({ minX, maxX, minY, maxY, exp, childs: [smoothStepA, smoothStepB], meta });
    };

    /**
     * New Discrete Function
     * @param {Object} params
     * @param {number} params.tolerance - 
     * @param {number} params.defaultVal - 
     * @param {Array<{x: number, y: number}>} params.points - 
     * @param {MathFunctionParams} mathFunctionParams
     * @returns {MathFunction}
    */
    const newDiscrete = (params, mathFunctionParams) => {

        const defaultVals = { tolerance: 0.01, defaultVal: 0, points: [] };
        const { tolerance, defaultVal, points } = { ...defaultVals, ...params };

        const funcs = points.map(p => new MathFunction({
            exp: `${p.y - defaultVal / (points.length - 1)}`,
            meta: { label: 'Point', x: p.x, y: p.y },
            minX: p.x - tolerance,
            maxX: p.x + tolerance,
            overflowVal: defaultVal / points.length,
            underflowVal: defaultVal / points.length,
        }).serialize());

        const meta = { label: 'Discrete', tolerance, defaultVal, points };
        const exp = `0`;
        return new MathFunction({ exp, childs: funcs, meta });
    };

    /**
     * New InstallmentRevenue Function
     * @param {Object} params
     * @param {number} params.initialX - When sales start.
     * @param {number} params.totalUnits - Unit Available.
     * @param {number} params.unitsPerSale - Units per sale.
     * @param {number} params.salesStepSize - Distance between sales.
     * @param {number} params.pricePerUnit - Price per unit.
     * @param {number} params.installments - Number of payments.
     * @param {MathFunctionParams} mathFunctionParams
     * @returns {MathFunction}
    */
    const newInstallmentRevenue = (params, mathFunctionParams) => {

        const defaultVals = { initialX: 0, totalUnits: 1, unitsPerSale: 0.03, salesStepSize: 0.01, pricePerUnit: 1, installments: 64 };
        const { initialX, totalUnits, unitsPerSale, salesStepSize, pricePerUnit, installments } = { ...defaultVals, ...params };

        const minXs = parseInt(totalUnits / unitsPerSale);
        const rest = totalUnits % unitsPerSale;
        const childs = new Array(minXs).fill().map((_, i) => {
            const minX = initialX + i * salesStepSize;
            const value = unitsPerSale * pricePerUnit;
            return newConstant({ value }, { minX, maxX: minX + installments * salesStepSize, overflowVal: 0, underflowVal: 0, overflowInclude: true, underflowInclude: true }).serialize();
        });

        if (rest > 0) {
            const minX = initialX + minXs * salesStepSize;
            const value = rest * pricePerUnit;
            childs.push(newConstant({ value }, { minX, maxX: minX + installments * salesStepSize, overflowVal: 0, underflowVal: 0, overflowInclude: true, underflowInclude: true }).serialize());
        }
        const exp = '0';

        return new MathFunction({
            exp,
            childs,
            meta: { label: 'InstallmentRevenue', totalUnits, unitsPerSale, salesStep: salesStepSize, pricePerUnit, installments },
            ...mathFunctionParams
        });
    };

    return { newConstant, newLine, newSmoothStep, newSmoothStepBell, newDiscrete, newInstallmentRevenue };
})();

export default { MathFunction, MathFunctionsTemplates };