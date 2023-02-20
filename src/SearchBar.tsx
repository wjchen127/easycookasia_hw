import React, {FormEvent, KeyboardEvent, useEffect, useRef, useState} from "react";
import { fromEvent, filter, debounceTime, distinctUntilChanged, Observable, map, takeLast, find, throttleTime} from'rxjs';
// const algoliasearch = require("algoliasearch");
import algoliasearch from 'algoliasearch';
const client = algoliasearch("4INBZ089JX", "600cf7a70cda6c98f8cb99da4539225c");
const index = client.initIndex("test");

// interface searchObj extends Object{
//     objectID: string,
//     node:{
//         price: string,
//         product_name: string
//     }
// }
// function preventDefault<T extends Event>(): MonoTypeOperatorFunction<T> {
//     return tap(e => {
//         e.preventDefault();
//     });
// }

const SearchBar = () => {

    const mounted = useRef(false)
    const [searchResult, setSearchResult] = useState<Array<any>>()
    useEffect(()=>{
        if(mounted.current === false){
            mounted.current = true

            const fetchSearchSuggestion$: Observable<Event> = fromEvent(document.querySelector("#default-search") as HTMLInputElement, 'keypress')
            fetchSearchSuggestion$.pipe(
                map(e => (e.target as HTMLInputElement).value),
                distinctUntilChanged(),
                debounceTime(300),
            ).subscribe((val) => {
                // call API
                if(val.length == 0){
                    setSearchResult([])
                }else{
                    index
                    .search(val, {
                        restrictSearchableAttributes: [
                            'node.product_name'
                        ],
                    })
                    .then(({ hits }) => {
                        if(hits.length > 0){
                            setSearchResult(hits)
                        }else{
                            setSearchResult([])
                        }
                        
                        console.log(hits);
                    })
                    .catch(err => {
                        console.log(err);
                    });
                }
            });

            const HandleDelAndBackSpace$: Observable<Event> = fromEvent(document.querySelector("#default-search") as HTMLInputElement, 'keydown')
            HandleDelAndBackSpace$.pipe(
                map((e: any) => {
                    return e
                }),
                distinctUntilChanged(),
                debounceTime(300),
            ).subscribe((e) => {
                if(e.key === "Backspace" || e.key === "Delete"){
                    const input: HTMLInputElement | null = document.querySelector("#default-search")
                    if(input){

                        const searchResult = document.querySelector("#searchResult")
                        if(searchResult && searchResult.classList.contains("hidden")){
                            searchResult.classList.toggle("hidden")
                        }

                        if(input.value.length == 0){
                            setSearchResult([])
                        }else{
                            index
                            .search(input.value, {
                                restrictSearchableAttributes: [
                                    'node.product_name'
                                ],
                            })
                            .then(({ hits }) => {
                                if(hits.length > 0){
                                    setSearchResult(hits)
                                }else{
                                    setSearchResult([])
                                }
                                
                                console.log(hits);
                            })
                            .catch(err => {
                                console.log(err);
                            });
                        }
                    }
                }
            })

            const controllMovement$: Observable<Event> = fromEvent(document.querySelector("#default-search") as HTMLInputElement, 'keydown');
            controllMovement$.pipe(
                map((e: any) => {
                    return e
                }),
                throttleTime(50),
            ).subscribe((e)=>{
                if(e.key === "ArrowUp" || e.key === "ArrowDown"){
                    e.preventDefault()
                    const listItem: any = document.querySelectorAll("#searchResultList > ul > li > div")
                    const curSelectedItem: HTMLElement | null = document.querySelector("#searchResultList > ul > li > div[data-selected='true']")

                    const searchResult = document.querySelector("#searchResult")
                    if(searchResult && searchResult.classList.contains("hidden")){
                        searchResult.classList.toggle("hidden")
                        return
                    }


                    if(listItem){
                        if(!curSelectedItem){
                            listItem[0].dataset.selected = "true"
                            listItem[0].classList.toggle("bg-gray-100")
                        }else{
                            if(curSelectedItem.dataset.index){
                                const curSelectedIndex = parseInt(curSelectedItem.dataset.index)
                                const input = document.querySelector("#default-search") as HTMLInputElement
                                if(e.key === "ArrowUp" && curSelectedIndex >0){
                                    //除掉舊的css跟data
                                    curSelectedItem.dataset.selected = ""
                                    curSelectedItem.classList.toggle("bg-gray-100")

                                    const nextSelected = listItem[curSelectedIndex-1]
                                    nextSelected.dataset.selected = "true"
                                    nextSelected.classList.toggle("bg-gray-100")
                                    input.value = nextSelected.childNodes[1].innerText
                                }else if(e.key === "ArrowDown" && curSelectedIndex < listItem.length-1){
                                    //除掉舊的css跟data
                                    curSelectedItem.dataset.selected = ""
                                    curSelectedItem.classList.toggle("bg-gray-100")

                                    const nextSelected = listItem[curSelectedIndex+1]
                                    nextSelected.dataset.selected = "true"
                                    nextSelected.classList.toggle("bg-gray-100")
                                    input.value = nextSelected.childNodes[1].innerText
                                }
                            }
                        }
                    }      
                }else if(e.key === "Enter"){
                    e.preventDefault()
                    const input = document.querySelector("#default-search") as HTMLInputElement
                    const curSelectedItem: any = document.querySelector("#searchResultList > ul > li > div[data-selected='true']")
                    if(curSelectedItem){

                        input.value = curSelectedItem.childNodes[1].innerText
                        // setSearchResult([])
                        const searchResult = document.querySelector("#searchResult")
                        if(searchResult && !searchResult.classList.contains("hidden")){
                            searchResult.classList.toggle("hidden")
                        }
                    }
                }
            })
        }
    },[searchResult])


    return (
        <div className="grid place-items-center w-screen h-screen">
            <div className="relative w-1/2 min-w-[400px] top-[-80px]">
                <form>   
                    <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input type="search" id="default-search" className="block w-full p-3 pl-10 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" placeholder="Search" required  autoComplete="off"/>
                    </div>
                </form>
                {
                    searchResult && searchResult.length > 0 ? (
                        <div id="searchResult" className="absolute w-full rounded-lg bg-white px-[15px] py-[10px] mt-[10px]">
                        
                            <div className="flex justify-between">
                                <span className="text-xs  text-[#9d9d9d] font-bold">Product</span>
                                <span className="text-xs text-[#fe5b30] font-bold">See all</span>
                            </div>
                            <div id="searchResultList">
                                <ul>
                                        {
                                            searchResult.map((obj,i) => {
                                                return (
                                                    <li>
                                                        <div className="h-[42px] p-[5px] flex items-center rounded" data-index={i}>
                                                            <img src={require('./1.jpg')} alt=""  className="rounded-full h-full "/>
                                                            <span className="inline-block grow text-left text-sm font-bold ml-[12px]">{obj.node.product_name}</span>
                                                            <span className="text-xs inline-block px-[10px] pt-[2px]">€{obj.node.price}</span>
                                                            <span className="inline-block">&gt;</span>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                            </div>   
                        </div>
                    ) : (
                        <div id="searchLabel" className="absolute flex flex-row text-sm">
                            <div className="mr-[5px] my-[5px] ml-[2px] pb-[1px]">Popular searches</div>
                            <div className="mx-[3px] my-[5px] px-[5px] bg-[#DAECE4] rounded-lg">Korean</div>
                            <div className="mx-[3px] my-[5px] px-[5px] bg-[#DAECE4] rounded-lg">Bubble Tea</div>
                        </div>
                    )
                }
                
                
            </div>
        </div>
    )
}
export default SearchBar