"use strict";(self["webpackChunkfrontend"]=self["webpackChunkfrontend"]||[]).push([[4977],{44977:function(e,t,r){r.r(t),r.d(t,{conf:function(){return n},language:function(){return o}});
/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.50.0(c321d0fbecb50ab8a5365fa1965476b0ae63fc87)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/
var n={brackets:[["{","}"],["[","]"],["(",")"]],autoClosingPairs:[{open:"{",close:"}"},{open:"[",close:"]"},{open:"(",close:")"},{open:'"',close:'"'},{open:"'",close:"'"}],surroundingPairs:[{open:"{",close:"}"},{open:"[",close:"]"},{open:"(",close:")"},{open:'"',close:'"'},{open:"'",close:"'"}]},o={tokenPostfix:".julia",keywords:["begin","while","if","for","try","return","break","continue","function","macro","quote","let","local","global","const","do","struct","module","baremodule","using","import","export","end","else","elseif","catch","finally","mutable","primitive","abstract","type","in","isa","where","new"],types:["LinRange","LineNumberNode","LinearIndices","LoadError","MIME","Matrix","Method","MethodError","Missing","MissingException","Module","NTuple","NamedTuple","Nothing","Number","OrdinalRange","OutOfMemoryError","OverflowError","Pair","PartialQuickSort","PermutedDimsArray","Pipe","Ptr","QuoteNode","Rational","RawFD","ReadOnlyMemoryError","Real","ReentrantLock","Ref","Regex","RegexMatch","RoundingMode","SegmentationFault","Set","Signed","Some","StackOverflowError","StepRange","StepRangeLen","StridedArray","StridedMatrix","StridedVecOrMat","StridedVector","String","StringIndexError","SubArray","SubString","SubstitutionString","Symbol","SystemError","Task","Text","TextDisplay","Timer","Tuple","Type","TypeError","TypeVar","UInt","UInt128","UInt16","UInt32","UInt64","UInt8","UndefInitializer","AbstractArray","UndefKeywordError","AbstractChannel","UndefRefError","AbstractChar","UndefVarError","AbstractDict","Union","AbstractDisplay","UnionAll","AbstractFloat","UnitRange","AbstractIrrational","Unsigned","AbstractMatrix","AbstractRange","Val","AbstractSet","Vararg","AbstractString","VecElement","AbstractUnitRange","VecOrMat","AbstractVecOrMat","Vector","AbstractVector","VersionNumber","Any","WeakKeyDict","ArgumentError","WeakRef","Array","AssertionError","BigFloat","BigInt","BitArray","BitMatrix","BitSet","BitVector","Bool","BoundsError","CapturedException","CartesianIndex","CartesianIndices","Cchar","Cdouble","Cfloat","Channel","Char","Cint","Cintmax_t","Clong","Clonglong","Cmd","Colon","Complex","ComplexF16","ComplexF32","ComplexF64","CompositeException","Condition","Cptrdiff_t","Cshort","Csize_t","Cssize_t","Cstring","Cuchar","Cuint","Cuintmax_t","Culong","Culonglong","Cushort","Cvoid","Cwchar_t","Cwstring","DataType","DenseArray","DenseMatrix","DenseVecOrMat","DenseVector","Dict","DimensionMismatch","Dims","DivideError","DomainError","EOFError","Enum","ErrorException","Exception","ExponentialBackOff","Expr","Float16","Float32","Float64","Function","GlobalRef","HTML","IO","IOBuffer","IOContext","IOStream","IdDict","IndexCartesian","IndexLinear","IndexStyle","InexactError","InitError","Int","Int128","Int16","Int32","Int64","Int8","Integer","InterruptException","InvalidStateException","Irrational","KeyError"],keywordops:["<:",">:",":","=>","...",".","->","?"],allops:/[^\w\d\s()\[\]{}"'#]+/,constants:["true","false","nothing","missing","undef","Inf","pi","NaN","π","ℯ","ans","PROGRAM_FILE","ARGS","C_NULL","VERSION","DEPOT_PATH","LOAD_PATH"],operators:["!","!=","!==","%","&","*","+","-","/","//","<","<<","<=","==","===","=>",">",">=",">>",">>>","\\","^","|","|>","~","÷","∈","∉","∋","∌","∘","√","∛","∩","∪","≈","≉","≠","≡","≢","≤","≥","⊆","⊇","⊈","⊉","⊊","⊋","⊻"],brackets:[{open:"(",close:")",token:"delimiter.parenthesis"},{open:"{",close:"}",token:"delimiter.curly"},{open:"[",close:"]",token:"delimiter.square"}],ident:/π|ℯ|\b(?!\d)\w+\b/,escape:/(?:[abefnrstv\\"'\n\r]|[0-7]{1,3}|x[0-9A-Fa-f]{1,2}|u[0-9A-Fa-f]{4})/,escapes:/\\(?:C\-(@escape|.)|c(@escape|.)|@escape)/,tokenizer:{root:[[/(::)\s*|\b(isa)\s+/,"keyword","@typeanno"],[/\b(isa)(\s*\(@ident\s*,\s*)/,["keyword",{token:"",next:"@typeanno"}]],[/\b(type|struct)[ \t]+/,"keyword","@typeanno"],[/^\s*:@ident[!?]?/,"metatag"],[/(return)(\s*:@ident[!?]?)/,["keyword","metatag"]],[/(\(|\[|\{|@allops)(\s*:@ident[!?]?)/,["","metatag"]],[/:\(/,"metatag","@quote"],[/r"""/,"regexp.delim","@tregexp"],[/r"/,"regexp.delim","@sregexp"],[/raw"""/,"string.delim","@rtstring"],[/[bv]?"""/,"string.delim","@dtstring"],[/raw"/,"string.delim","@rsstring"],[/[bv]?"/,"string.delim","@dsstring"],[/(@ident)\{/,{cases:{"$1@types":{token:"type",next:"@gen"},"@default":{token:"type",next:"@gen"}}}],[/@ident[!?'']?(?=\.?\()/,{cases:{"@types":"type","@keywords":"keyword","@constants":"variable","@default":"keyword.flow"}}],[/@ident[!?']?/,{cases:{"@types":"type","@keywords":"keyword","@constants":"variable","@default":"identifier"}}],[/\$\w+/,"key"],[/\$\(/,"key","@paste"],[/@@@ident/,"annotation"],{include:"@whitespace"},[/'(?:@escapes|.)'/,"string.character"],[/[()\[\]{}]/,"@brackets"],[/@allops/,{cases:{"@keywordops":"keyword","@operators":"operator"}}],[/[;,]/,"delimiter"],[/0[xX][0-9a-fA-F](_?[0-9a-fA-F])*/,"number.hex"],[/0[_oO][0-7](_?[0-7])*/,"number.octal"],[/0[bB][01](_?[01])*/,"number.binary"],[/[+\-]?\d+(\.\d+)?(im?|[eE][+\-]?\d+(\.\d+)?)?/,"number"]],typeanno:[[/[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*\{/,"type","@gen"],[/([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*)(\s*<:\s*)/,["type","keyword"]],[/[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*/,"type","@pop"],["","","@pop"]],gen:[[/[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*\{/,"type","@push"],[/[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*/,"type"],[/<:/,"keyword"],[/(\})(\s*<:\s*)/,["type",{token:"keyword",next:"@pop"}]],[/\}/,"type","@pop"],{include:"@root"}],quote:[[/\$\(/,"key","@paste"],[/\(/,"@brackets","@paren"],[/\)/,"metatag","@pop"],{include:"@root"}],paste:[[/:\(/,"metatag","@quote"],[/\(/,"@brackets","@paren"],[/\)/,"key","@pop"],{include:"@root"}],paren:[[/\$\(/,"key","@paste"],[/:\(/,"metatag","@quote"],[/\(/,"@brackets","@push"],[/\)/,"@brackets","@pop"],{include:"@root"}],sregexp:[[/^.*/,"invalid"],[/[^\\"()\[\]{}]/,"regexp"],[/[()\[\]{}]/,"@brackets"],[/\\./,"operator.scss"],[/"[imsx]*/,"regexp.delim","@pop"]],tregexp:[[/[^\\"()\[\]{}]/,"regexp"],[/[()\[\]{}]/,"@brackets"],[/\\./,"operator.scss"],[/"(?!"")/,"string"],[/"""[imsx]*/,"regexp.delim","@pop"]],rsstring:[[/^.*/,"invalid"],[/[^\\"]/,"string"],[/\\./,"string.escape"],[/"/,"string.delim","@pop"]],rtstring:[[/[^\\"]/,"string"],[/\\./,"string.escape"],[/"(?!"")/,"string"],[/"""/,"string.delim","@pop"]],dsstring:[[/^.*/,"invalid"],[/[^\\"\$]/,"string"],[/\$/,"","@interpolated"],[/@escapes/,"string.escape"],[/\\./,"string.escape.invalid"],[/"/,"string.delim","@pop"]],dtstring:[[/[^\\"\$]/,"string"],[/\$/,"","@interpolated"],[/@escapes/,"string.escape"],[/\\./,"string.escape.invalid"],[/"(?!"")/,"string"],[/"""/,"string.delim","@pop"]],interpolated:[[/\(/,{token:"",switchTo:"@interpolated_compound"}],[/[a-zA-Z_]\w*/,"identifier"],["","","@pop"]],interpolated_compound:[[/\)/,"","@pop"],{include:"@root"}],whitespace:[[/[ \t\r\n]+/,""],[/#=/,"comment","@multi_comment"],[/#.*$/,"comment"]],multi_comment:[[/#=/,"comment","@push"],[/=#/,"comment","@pop"],[/=(?!#)|#(?!=)/,"comment"],[/[^#=]+/,"comment"]]}}}}]);
//# sourceMappingURL=4977.8288ffd6.js.map