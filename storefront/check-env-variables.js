const c = require("ansi-colors")

const requiredEnvs = [
  {
    key: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    // TODO: we need a good doc to point this to
    description:
      "Learn how to create a publishable key: https://docs.medusajs.com/v2/resources/storefront-development/publishable-api-keys",
  },
]

const optionalEnvs = [
  {
    key: "NEXT_PUBLIC_STRIPE_KEY",
    description:
      "Stripe publishable key for payment processing. Get it from your Stripe dashboard.",
  },
  {
    key: "NEXT_PUBLIC_PAYPAL_CLIENT_ID",
    description:
      "PayPal client ID for payment processing. Get it from your PayPal developer dashboard.",
  },
]

function checkEnvVariables() {
  const missingEnvs = requiredEnvs.filter(function (env) {
    return !process.env[env.key]
  })

  if (missingEnvs.length > 0) {
    console.error(
      c.red.bold("\n🚫 Error: Missing required environment variables\n")
    )

    missingEnvs.forEach(function (env) {
      console.error(c.yellow(`  ${c.bold(env.key)}`))
      if (env.description) {
        console.error(c.dim(`    ${env.description}\n`))
      }
    })

    console.error(
      c.yellow(
        "\nPlease set these variables in your .env file or environment before starting the application.\n"
      )
    )

    process.exit(1)
  }

  // Check optional envs and warn if missing
  const missingOptionalEnvs = optionalEnvs.filter(function (env) {
    return !process.env[env.key]
  })

  if (missingOptionalEnvs.length > 0) {
    console.warn(
      c.yellow.bold("\n⚠️  Warning: Missing optional environment variables\n")
    )

    missingOptionalEnvs.forEach(function (env) {
      console.warn(c.yellow(`  ${c.bold(env.key)}`))
      if (env.description) {
        console.warn(c.dim(`    ${env.description}\n`))
      }
    })

    console.warn(
      c.yellow(
        "\nThese are optional but required for specific payment methods to work.\n"
      )
    )
  }
}

module.exports = checkEnvVariables
