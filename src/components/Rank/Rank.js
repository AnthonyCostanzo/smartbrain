import React,{useState,useEffect} from 'react';

const Rank = ({ name, entries }) => {
  const [emoji,setEmoji] = useState("");
  const generateEmoji = (entries) => {
    fetch(`https://8g35oa3i3j.execute-api.us-east-1.amazonaws.com/rank?rank=${entries}`)
    .then(resp=> resp.json())
    .then(emoji => setEmoji(emoji.input))
    .catch(console.log)
  }
  useEffect(()=>{
    generateEmoji(entries)
  },[])
  useEffect(()=>{
    generateEmoji(entries)
  },[entries,name])
  return (
    <div>
      <div className='white f3'>
        {`${name}, your current entry count is...`}
      </div>
      <div className='white f1'>
        {entries}
      </div>
      <div className='white f1'>
        {`Rank Badge: ${emoji}`}
      </div>
    </div>
  );
}

export default Rank;