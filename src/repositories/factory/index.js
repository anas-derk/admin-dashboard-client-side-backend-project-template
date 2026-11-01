function createRepository(model) {
    async function create(data, options = {}) {
        const instance = new model(data);
        return instance.save(options.session ? { session: options.session } : undefined);
    }

    async function list(options = {}) {
        const {
            filters = {},
            projection = null,
            sort = null,
            page = 1,
            pageSize,
            lean = false,
            session,
        } = options;
        const query = model.find(filters, projection);

        if (sort) query.sort(sort);
        if (pageSize) query.skip((page - 1) * pageSize).limit(pageSize);
        if (session) query.session(session);
        if (lean) query.lean();

        const countQuery = model.countDocuments(filters);
        if (session) countQuery.session(session);

        if (session) {
            const rows = await query.exec();
            const count = await countQuery.exec();
            return { rows, count };
        }

        const [rows, count] = await Promise.all([query.exec(), countQuery.exec()]);
        return { rows, count };
    }

    async function retrieve(identifier, options = {}) {
        const filters = typeof identifier === "object" && identifier !== null
            ? identifier
            : { _id: identifier };
        const query = model.findOne(filters, options.projection || null);

        if (options.session) query.session(options.session);
        if (options.lean) query.lean();

        return query.exec();
    }

    async function update(instanceOrFilters, updates, options = {}) {
        if (instanceOrFilters && typeof instanceOrFilters.save === "function") {
            Object.assign(instanceOrFilters, updates);
            return instanceOrFilters.save(options.session ? { session: options.session } : undefined);
        }

        return model.findOneAndUpdate(instanceOrFilters, updates, {
            new: true,
            runValidators: true,
            ...options,
        });
    }

    async function remove(instanceOrFilters, options = {}) {
        if (instanceOrFilters && typeof instanceOrFilters.deleteOne === "function") {
            return instanceOrFilters.deleteOne(options.session ? { session: options.session } : undefined);
        }

        return model.findOneAndDelete(instanceOrFilters, options);
    }

    return {
        create,
        list,
        retrieve,
        update,
        delete: remove,
    };
}

module.exports = createRepository;
