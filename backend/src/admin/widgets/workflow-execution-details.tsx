import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps } from "@medusajs/framework/types"
import { clx, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"

type WorkflowExecution = {
  id: string
  workflow_id: string
  transaction_id: string
  execution: any
  context: any
  state: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  retention_time: number | null
}

type WorkflowExecutionResponse = {
  workflow_execution: WorkflowExecution
}

const WorkflowExecutionDetailsWidget = ({ 
  data: workflowExecution,
}: DetailWidgetProps<WorkflowExecution>) => {
  const { data: queryResult } = useQuery<WorkflowExecutionResponse>({
    queryFn: () => sdk.client.fetch(`/admin/workflow-executions/${workflowExecution.id}`, {
      method: "GET",
    }),
    queryKey: [["workflowExecution", workflowExecution.id]],
  })

  const execution = queryResult?.workflow_execution

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Workflow Execution Details</Heading>
        </div>
      </div>
      <div
        className={clx(
          `text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4`
        )}
      >
        <Text size="small" weight="plus" leading="compact">
          Workflow ID
        </Text>

        <Text
          size="small"
          leading="compact"
          className="whitespace-pre-line text-pretty"
        >
          {execution?.workflow_id || "-"}
        </Text>
      </div>
      <div
        className={clx(
          `text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4`
        )}
      >
        <Text size="small" weight="plus" leading="compact">
          Created At
        </Text>

        <Text
          size="small"
          leading="compact"
          className="whitespace-pre-line text-pretty"
        >
          {execution?.created_at ? new Date(execution.created_at).toLocaleString() : "-"}
        </Text>
      </div>
      <div
        className={clx(
          `text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4`
        )}
      >
        <Text size="small" weight="plus" leading="compact">
          Retention Time
        </Text>

        <Text
          size="small"
          leading="compact"
          className="whitespace-pre-line text-pretty"
        >
          {execution?.retention_time ?? "-"}
        </Text>
      </div>
      <div
        className={clx(
          `text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4`
        )}
      >
        <Text size="small" weight="plus" leading="compact">
          State
        </Text>

        <Text
          size="small"
          leading="compact"
          className="whitespace-pre-line text-pretty"
        >
          {execution?.state || "-"}
        </Text>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "workflow.details.before",
})

export default WorkflowExecutionDetailsWidget 