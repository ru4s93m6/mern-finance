import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardContent,
    CardAction
} from "./ui/card"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "./ui/collapsible"

import { Button } from "./ui/button"
import { ChevronDown, Plus  } from "lucide-react"

export default function AccountCard(){
    return(
        <Card className="p-4">
            <CardHeader className="flex flex-row justify-between items-center ">
                <CardTitle>我的帳戶</CardTitle>
                <CardAction>
                    <Button variant="outline"><Plus /></Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                            <ChevronDown className="h-4 w-4" />
                            <span>流動資產</span>
                        </div>
                        <span className="font-semibold">275,000</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                    {/* bank list here */}
                    </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                            <ChevronDown className="h-4 w-4" />
                            <span>投資資產</span>
                        </div>
                        <span className="font-semibold">275,000</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                    {/* bank list here */}
                    </CollapsibleContent>
                </Collapsible>

                <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                            <ChevronDown className="h-4 w-4" />
                            <span>信用負債</span>
                        </div>
                        <span className="font-semibold text-red-600">275,000</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                    {/* bank list here */}
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    )
}