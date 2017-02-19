import { Delegator } from './delegator'

export class BaseHandler extends Delegator {
  constructor ({dh, service, name, drake, dragModel, options = {}}) {
    super()

    if (dh) {
      this.dh = dh
    }
    this.configDelegates()

    this.name = name
    this.drake = drake
    this.dragModel = this.dragModel || dragModel
    this.logging = service.logging
    this.service = service
    this.logger = options.logger || console
    this.options = options
  }

  configDelegates () {
    if (this.dh) {
      this.delegateFor('dh', {props: ['drake', 'dragModel', 'modelHandler', 'dragulaEventHandler']})
    }

    this.delegateFor('service', {props: ['eventBus', 'modelManager'], methods: ['findModelForContainer', 'domIndexOf']})
    this.delegateFor('dragModel', {props: ['sourceModel', 'targetModel', 'dragIndex', 'dropIndex', 'dragElm']})
  }

  get clazzName () {
    return this.constructor.name
    // throw new Error('BaseHandler Subclass must override clazzName getter')
  }

  get shouldLog () {
    return this.logging && this.logging.dragHandler
  }

  log (event, ...args) {
    if (!this.shouldLog) return
    this.logger.log(`${this.clazzName} [${this.name}] :`, event, ...args)
  }

  createCtx ({el, source, target, models}) {
    return {
      element: el,
      containers: {
        source,
        target
      },
      indexes: this.indexes,
      models
    }
  }

  getModel (container) {
    this.log('getModel', container, this)
    return this.modelManager.createFor({
      name: this.name,
      logging: this.logging,
      model: this.findModelForContainer(container, this.drake)
    })
  }

  get indexes () {
    return {
      indexes: {
        source: this.dragIndex,
        target: this.dropIndex
      }
    }
  }

  emit (eventName, opts = {}) {
    opts.sourceModel = this.sourceModel
    opts.name = this.name
    let serviceEventName = `${this.serviceName}:${eventName}`

    this.log('emit', serviceEventName, eventName, opts)
    this.eventBus.$emit(eventName, opts)
    this.eventBus.$emit(serviceEventName, opts)
  }
}