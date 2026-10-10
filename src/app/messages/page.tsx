import { getMessagesByContainer } from "@/server/actions/messages";

export default async function MessagesPage(props: PageProps<"/messages">) {
  const {container} = await props.searchParams;

  const messages = await getMessagesByContainer(container as string);
  return (
    <ul>
      {messages.map(message => (
        <li key={message.id}>{message.text}</li>
      ))}
    </ul>
  )
}
