pragma solidity >0.4.99 <0.6.0;

contract ShareApp{
   
   //租借者信息
	struct Renter{
		address payable addr;    //租借者地址
		uint since;      //租借开始时间
	}

    //物品信息
	struct Object{
		address payable creator; // 物品拥有者
		string name;    //物品名称
		uint priceDaily;  //出租物品单价
		uint deposit;     //共享物品押金
		Renter renter;    //租借者
		bool rented;      //是否被租借
		string detail;    //物品详情
		string image_addr; //物品图片地址
	}

	struct NameKey{ // storage the name's keys
		uint[] keys;
	}

	//物品列表
	uint[]  ids;  //Use it to return the ids of Objects
	uint  numObjects;  //物品数量
	//存储物体的数组
	Object[] objects;
	mapping(string => uint) nameToid;
  //	mapping(uint => Object) private objects;   //物品Id到物品结构体的映射
   //	mapping(string => NameKey) private nameToKeys;     
	
	address public owner;

	//E创建新物品时的事件
	event NewObject(uint objID, address creator);
	 
	//构造函数，用于存储代币的管理者
	constructor() public{
     	owner = msg.sender;
    } 
   
   //按照商品名查找商品ID
	function getIdBy_name(string memory name) public view returns(uint ){
	    
	    return nameToid[name];
	}
	
	//按照Id查找物品ID
	function  objectIsRented(uint objID)  public view returns (bool){
		return objects[objID].rented;
	}
    
    //创建新的物品
	function createObj(string memory name,uint priceDaily,uint deposit,string memory detail,string memory addr) public returns(uint){
		Object memory  newObject ;//= objects[numObjects];
		//nameToKeys[name].keys.push(numObjects); //add the key to the name's keys

		newObject.creator = msg.sender;
		newObject.name = name;
		newObject.priceDaily = priceDaily;
		newObject.deposit = deposit;
		newObject.rented = false;
		newObject.detail = detail;
        newObject.image_addr = addr;

	//	emit NewObject(numObjects,msg.sender);
	  //  objects.push(newObject);
	    objects.push(newObject);
	    nameToid[name]=numObjects;
	    ids.push(numObjects);
		numObjects++;
		
		return numObjects;
	}
   
   //租借物品
    function rentObj(uint id,uint datetamp,address payable intermediator,address payable renter) public  returns(bool){
        
        Object memory temp = objects[id];
        
        if (temp.rented)
           return false;
        if (temp.creator == renter)
           return false;
        if (renter.balance < temp.deposit)
           return false;
           
        objects[id].rented = true;
        objects[id].renter.addr = renter;
        objects[id].renter.since = datetamp;
        
        intermediator.send(temp.deposit);
        
        return true;
        
    }
   

   //归还物品
   function backObj(uint id,uint datetamp) public payable returns(bool){
       Object memory temp = objects[id];
       
       if(!temp.rented)
         return false;
       
       
       objects[id].rented = false;
       objects[id].renter.addr = 0x0000000000000000000000000000000000000000;
       objects[id].renter.since = 0;
       
       
       objects[id].creator.send(msg.value);
       objects[id].renter.addr.send(temp.deposit- msg.value);
       return true;
       
   }
   
   //返回已租借物品的起始租借时间
   function getRentTime(uint id, uint now_date) public view returns (uint){
       
       if (!objects[id].rented){
           return 0;
       }
       
       return now_date - objects[id].renter.since;
   }
   
   
   //返回当前物品的数量
    function getObjectsNumber() public view returns(uint){
        return numObjects;
    }
    
    
   //按照物品ID返回物品信息
   function getObjectBy_id(uint id) public view returns(address  , string memory , uint , uint ,string memory, string memory , bool  , uint ){
       
       return (objects[id].creator , objects[id].name , objects[id].priceDaily , objects[id].deposit , objects[id].detail , objects[id].image_addr , objects[id].rented , id );
       
   }

  
  //按照物品ID返回物品租借者
   function getObjectRenter_Byid(uint id) public view returns(uint ,address){
       
      return (objects[id].renter.since , objects[id].renter.addr);
  }
   
   
   

}