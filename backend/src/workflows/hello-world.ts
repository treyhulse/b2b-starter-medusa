import { createStep, StepResponse, WorkflowResponse, createWorkflow, } from "@medusajs/framework/workflows-sdk"

type WorkflowInput = {
    name: string
  }

  // step 1
const step1 = createStep(
  "step-1", 
  async () => {
    return new StepResponse(`Hello from step one!`)
  }
)

  // step 2
  const step2 = createStep(
    "step-2", 
    async ({ name }: WorkflowInput) => {
      return new StepResponse(`Hello ${name} from step two!`)
    }
  )

  // workflow
  const myWorkflow = createWorkflow(
    {
        name: "hello-world",
        store: true,
        retentionTime: 86400,
      },
    function (input: WorkflowInput) {
      const str1 = step1()
      // to pass input to step 2
      const str2 = step2(input)
  
      return new WorkflowResponse({
        message: str2,
      })
    }
  )
  
  export default myWorkflow