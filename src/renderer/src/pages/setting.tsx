
import { Input } from "@/components/ui/input"
import { useAppStore } from "../store"
import { Button } from "@/components/ui/button"
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent, SelectGroup } from "@/components/ui/select"


export default function Setting() {

    const urls = useAppStore(state => state.urls)
    const addUrl = useAppStore(state => state.addUrl)
    const setDefaultUrl = useAppStore(state => state.setDefaultUrl)
    const defaultUrl = useAppStore(state => state.defaultUrl)
    let inputVal = ""
    return (
        <div className="flex flex-col p-4 gap-4">
            <div className="flex  items-center space-x-2">
                <Input onChange={(e) => { inputVal = e.target.value }}></Input>
                <Button onClick={() => {
                    if (inputVal.length)
                        addUrl(inputVal)
                }}>添加</Button>
            </div>
            <Select onValueChange={e => {
                window.API.sendMessage("setDefaultUrl", e).catch(err => console.error(err))
                window.API.sendMessage("setUrls", urls).catch(err => console.error(err))
                setDefaultUrl(e)
            }} defaultValue={defaultUrl}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {
                            urls.map((url, index) => {
                                return <SelectItem value={url} key={index}>{url}</SelectItem>
                            })
                        }
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}