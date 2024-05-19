
/*
TODO: Implement the mechanism of API requests. It is recommended to do it via:
$('.nav-tabs a').on('shown.bs.tab', function(event){
    var x = $(event.target).text();         // active tab
    var y = $(event.relatedTarget).text();  // previous tab
    $(".act span").text(x);
    $(".prev span").text(y);
  });
*/
var BaseHandler = function(selector, e) {
    this.selector = selector;
    this.element = $(selector);
    this.e = e;
}

BaseHandler.prototype.assignEvent = function(event) {
    event.target = event.target.closest(this.selector);
    return event;
}

/*
* Abstract methods
*/
BaseHandler.prototype.eventHandler = function(event) {
    throw new Error('Abstract method must be implemented.');
}

BaseHandler.prototype.setupEventHandler = function() {
    throw new Error('Abstract method must be implemented.');
}

/*
 ****************************
*/

var BasePOSTEventHandler = function(selector) {
    BaseHandler.call(this, selector, 'click submit');
    this.dataFieldName = 'data-field';
    this.dataFormName = 'data-form';
}
BasePOSTEventHandler.prototype = Object.create(BaseHandler.prototype);
BasePOSTEventHandler.constructor = BasePOSTEventHandler;


BasePOSTEventHandler.prototype.serializeData = function(context) {  
    var formData = new FormData();
    for (let key in context) {
        if (context.hasOwnProperty(key)) {
            formData.append(key, context[key]);
        }
    }
    let isEmpty = true;
        for (let pair of formData.entries()) {
            isEmpty = false;
            break;
        }
    if (isEmpty) {
        throw new Error('FormData is empty.');
    }
    return formData;
}

BasePOSTEventHandler.prototype.setupEventHandler = function() {
    var self = this;
    $(this.element).on(this.e, (event) => {
        event.preventDefault();
        event = self.assignEvent(event);
        var context = self.getContextData(event);
        var data = self.serializeData(context);
        self.eventHandler(event, data);
    });
}


BasePOSTEventHandler.prototype.getContextData = function(event) {
    /* 
     * This function gets the context of the data being sent. Perhaps, I can use some html properties etc.
    */
    var target = event.target;
    var fields = $(`.js-field[${this.dataFormName}="${$(target).attr(this.dataFormName)}"]`);
    console.debug(`.js-field[${this.dataFormName}="${$(target).attr(this.dataFormName)}"]`);
    var context = {};
    for (let field of fields) {
        if ($(field).attr(this.dataFieldName) === undefined) {
            throw new Error('Data field is not defined.')
        }
        var fieldName = $(field).attr(this.dataFieldName);

        /*
        ! Debug only
        */
        console.debug(field, fieldName);
        if ($(field).attr('value') !== undefined) {
            context[fieldName] = $(field).attr('value');
        }
        else if ($(field).text() !== '') {
            context[fieldName] = $(field).text()
        }
    }

    /*
    ! Debug only
    */
    console.debug(context);
    if (Object.entries(context).length === 0) {
        throw new Error('Context is not defined');
    }

    return context;
}


/*
* Abstract methods
*/
BasePOSTEventHandler.prototype.eventHandler = function(event, data) {
    throw new Error('Abstract method must be implemented.');
}

/*
 ****************************
*/

var BaseDefaultEventHandler = function(selector, e) {
    BaseHandler.call(this, selector, e);
}

BaseDefaultEventHandler.prototype = Object.create(BaseHandler.prototype);
BaseDefaultEventHandler.constructor = BaseDefaultEventHandler;

BaseDefaultEventHandler.prototype.setupEventHandler = function() {
    var self = this;
    $(this.element).on(this.e, (event) => {
        event.preventDefault();
        event = self.assignEvent(event);
        self.eventHandler(event);
    });
}


/*
 ****************************
*/


var BaseGETEventHandler = function(selector, e, bodySchema) {
    this.bodySchema = bodySchema;
    if (this.bodySchema === undefined) {
        throw new Error('Abstract class field must be implemented.');
    }
    BaseHandler.call(this, selector, e);
}

BaseGETEventHandler.prototype = Object.create(BaseHandler.prototype);
BaseGETEventHandler.constructor = BaseGETEventHandler;

BaseGETEventHandler.prototype.validateSchema = function(object) {
    if (typeof this.bodySchema !== 'object' || this.bodySchema === null) {
        throw new Error('bodySchema must be an object');
    }

    // Проходимся по каждому ключу в схеме
    for (let key in this.bodySchema) {
        // Проверяем, есть ли такой ключ в объекте
        if (!(key in object)) {
            throw new Error(`${key} is missing in this.bodySchema: ${object}`);
        }

        // Проверяем тип значения ключа в объекте
        const expectedType = this.bodySchema[key];
        const actualType = typeof object[key];

        if (expectedType === 'any') {
            continue; // Пропускаем проверку типа, если тип any
        }

        if (actualType !== expectedType) {
            throw new Error(`${key} must be a type of ${expectedType}`);
        }
    }
    return this.bodySchema;
}

BaseGETEventHandler.prototype.setupEventHandler = function() {
    var self = this;
    $(this.element).on(this.e, (event) => {
        event.preventDefault();
        event = self.assignEvent(event);
        dataRequest = self.requestData(event);
        data = self.validateSchema(dataRequest);
        self.eventHandler(event, data);
    });
}

BaseGETEventHandler.prototype.requestData = function(event) {
    throw new Error('Abstract method must be implemented.');
}

BaseGETEventHandler.prototype.eventHandler = function(event, data) {
    throw new Error('Abstract method must be implemented.');
}


/*
 ****************************
*/


var BaseDocumentEventHandler = function(e, bodySchema) {
    var selector = document;
    BaseGETEventHandler.call(this, selector, e, bodySchema);
}

BaseDocumentEventHandler.prototype = Object.create(BaseGETEventHandler.prototype);
BaseDocumentEventHandler.constructor = BaseDocumentEventHandler;


BaseDocumentEventHandler.prototype.assignEvent = function(event) {
    return event;
}


/*
 ****************************
*/


var BaseDocumentReadyHandler = function(bodySchema) {
    BaseDocumentEventHandler.call(this, '', bodySchema);
}

BaseDocumentReadyHandler.prototype = Object.create(BaseDocumentEventHandler.prototype);
BaseDocumentReadyHandler.constructor = BaseDocumentReadyHandler;


BaseDocumentReadyHandler.prototype.setupEventHandler = function() {
    var self = this;
    $(this.element).ready((event) => {
        event.preventDefault();
        event = self.assignEvent(event);
        dataRequest = self.requestData(event);
        data = self.validateSchema(dataRequest);
        self.eventHandler(event, data);
    });
}


/*
 ****************************
*/

var EditableEventHandler = function() {
    const selector = '.js-editable';
    BaseDefaultEventHandler.call(this, selector, 'click');

    this.dataFieldName = 'data-field';
    this.dataFieldButtonName = 'data-related';
}

EditableEventHandler.prototype = Object.create(BaseDefaultEventHandler.prototype);
EditableEventHandler.constructor = EditableEventHandler;

EditableEventHandler.prototype.eventHandler = function(event) {
    /* 
    ! BUG HERE: Gotta set cursor where is clicked but the cursor position in the beginning of the field
    */

    var target = event.target;
    var buttonRelated = $(`.js-btn-editable[${this.dataFieldButtonName}='${$(target).attr(this.dataFieldName)}']`);
    console.log($(target).prop('contenteditable'))
    if ($(target).prop('contenteditable') != 'true') {
        $(target).prop('contenteditable', true);
        $(target).focus();
        $(target).removeClass('d-none');
    }
    /*
    ! Debug only
    */
    console.debug(`.js-btn-editable[${this.dataFieldButtonName}='${$(target).attr(this.dataFieldName)}']`);
    if (buttonRelated.length !== 0) {
        $(buttonRelated).removeClass('d-none');
    }
}

/*
 ****************************
*/

var CancelEditableEventHandler = function() {
    /*
    ! Debug only
    */
    var bodySchema = {
        field: 'string',
    }

    BaseDocumentEventHandler.call(this, 'mousedown', bodySchema);
}


CancelEditableEventHandler.prototype = Object.create(BaseDocumentEventHandler.prototype);
CancelEditableEventHandler.constructor = CancelEditableEventHandler;

/*
! Debug only
*/
CancelEditableEventHandler.prototype.requestData = function(event) {
    return;
}

/*
! Debug only
*/
CancelEditableEventHandler.prototype.validateSchema = function(dataRequest) {
    return;
}

CancelEditableEventHandler.prototype.eventHandler = function(event, data) {
    if ($(event.target).closest('.js-editable').length) {
        return;
    }
    $('.js-btn-editable').addClass('d-none');
    $('.js-editable').prop('contenteditable', false);
}


/*
 ****************************
*/


var EditableFieldFormEvent = function() {
    var selector = '.js-field-submit';
    BasePOSTEventHandler.call(this, selector, 'click submit');

    this.dataFieldName = 'data-field';
    this.dataFieldSubmitName = 'data-related';
    
}
EditableFieldFormEvent.prototype = Object.create(BasePOSTEventHandler.prototype);
EditableFieldFormEvent.constructor = EditableFieldFormEvent;

EditableFieldFormEvent.prototype.eventHandler = function(event, data) {
    /*
    ! Debug only
    */
    var target = event.target;
    $(target).addClass('d-none');
    $('.js-editable').each((item) => {
        $(item).prop('contenteditable', false);
    });
    console.debug(`EditableFieldFormEventHandler.prototype.eventHandler: ${event.target}, ${data}`);

}

/*
 ****************************
*/

var GridLayoutLoader = function() {
    var bodySchema = {
        start_date: Date(2024, 4, 18, 12, 30, 0),
        end_date: Date(2024, 6, 18, 30, 0),
    }

    BaseDocumentReadyHandler.call(this, bodySchema);
    this.gridLayoutMonthsElement = $('.js-grid-layout-months');
    this.gridLayoutDaysElement = $('.js-grid-layout-days');

    if (this.gridLayoutMonthsElement.length === 0 || this.gridLayoutDaysElement.length === 0) {
        throw new Error('Some of grid layout elements were not found')
    }
}

GridLayoutLoader.prototype = Object.create(BaseDocumentReadyHandler.prototype);
GridLayoutLoader.constructor = GridLayoutLoader;

/*
! Debug only
*/
GridLayoutLoader.prototype.requestData = function(event) {
    return this.bodySchema;
}
/*
! Debug only
*/
GridLayoutLoader.prototype.validateSchema = function(dataRequest) {
    return dataRequest;
}

GridLayoutLoader.prototype.eventHandler = function(event, data) {
        
}


$(document).ready(() => {
    var editableHandler = new EditableEventHandler();
    var cancelEditableEventHandler = new CancelEditableEventHandler();
    var fieldFormEventHandler = new EditableFieldFormEvent();
    editableHandler.setupEventHandler();
    cancelEditableEventHandler.setupEventHandler();
    fieldFormEventHandler.setupEventHandler();
    /*
    $(document).on('mousedown', (event) => cancelEditing(event));
    projectNameEditable.click((event) => projectNameShowHandler(event));
    projectNameButton.click((event) => projectNameHandler(event));
    */
    
});
