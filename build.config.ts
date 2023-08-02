import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
  hooks: {
    'rollup:options': (ctx, option) => {
      if (Array.isArray(option.output)) {
        option.output.push(
          {
            name: 'Plum',
            dir: ctx.options.outDir,
            format: 'iife',
            exports: 'auto',
            preferConst: true,
            externalLiveBindings: false,
            freeze: false,
          },
        )
      }
    },
  },
})
